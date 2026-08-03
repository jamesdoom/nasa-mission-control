import { z } from "zod";
import type {
  Apod,
  Asteroid,
  AsteroidFeed,
  MediaAsset,
  MediaDetail,
  MediaItem,
  MediaSearch,
  MediaType,
} from "@mission-control/shared";
import { HttpError } from "./http-error.js";

const nasaApodSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.enum(["image", "video"]),
  url: z.string().url(),
  hdurl: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  copyright: z.string().optional(),
});

const nonNegativeNumber = z.coerce.number().finite().nonnegative();
const nasaApproachSchema = z.object({
  close_approach_date: z.string(),
  epoch_date_close_approach: z.number().int().nonnegative(),
  relative_velocity: z.object({ kilometers_per_hour: nonNegativeNumber }),
  miss_distance: z.object({
    kilometers: nonNegativeNumber,
    lunar: nonNegativeNumber,
  }),
  orbiting_body: z.literal("Earth"),
});
const nasaAsteroidSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nasa_jpl_url: z.string().url(),
  estimated_diameter: z.object({
    meters: z.object({
      estimated_diameter_min: nonNegativeNumber,
      estimated_diameter_max: nonNegativeNumber,
    }),
  }),
  is_potentially_hazardous_asteroid: z.boolean(),
  is_sentry_object: z.boolean(),
  close_approach_data: z.array(nasaApproachSchema).min(1),
});
const nasaAsteroidFeedSchema = z.object({
  element_count: z.number().int().nonnegative(),
  near_earth_objects: z.record(z.array(nasaAsteroidSchema)),
});

const mediaDataSchema = z.object({
  nasa_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  media_type: z.enum(["image", "video", "audio"]),
  date_created: z.string(),
  center: z.string().optional(),
  photographer: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
});
const mediaItemSchema = z.object({
  data: z.array(mediaDataSchema).min(1),
  links: z
    .array(
      z.object({
        href: z.string().url(),
        rel: z.string(),
        render: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
});
const mediaSearchSchema = z.object({
  collection: z.object({
    items: z.array(mediaItemSchema),
    metadata: z.object({ total_hits: z.number().int().nonnegative() }),
  }),
});
const mediaManifestSchema = z.object({
  collection: z.object({
    items: z.array(z.object({ href: z.string().url() })),
  }),
});

function normalizeMediaItem(item: z.infer<typeof mediaItemSchema>): MediaItem {
  const data = item.data[0];
  if (!data) {
    throw new HttpError(
      502,
      "UPSTREAM_UNAVAILABLE",
      "NASA returned media data in an unexpected format.",
    );
  }
  const preview = item.links.find(
    (link) =>
      link.render === "image" &&
      (link.rel === "preview" || link.rel === "alternate"),
  );
  return {
    nasaId: data.nasa_id,
    title: data.title,
    description: data.description,
    mediaType: data.media_type,
    dateCreated: data.date_created,
    center: data.center?.trim() === "" ? null : (data.center?.trim() ?? null),
    photographer:
      data.photographer?.trim() === ""
        ? null
        : (data.photographer?.trim() ?? null),
    keywords: data.keywords.slice(0, 12),
    previewUrl: preview?.href ?? null,
  };
}

function assetKind(url: string): MediaAsset["kind"] {
  const extension = new URL(url).pathname.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "tif", "tiff"].includes(extension ?? ""))
    return "image";
  if (["mp4", "m4v", "mov", "webm"].includes(extension ?? "")) return "video";
  if (["mp3", "wav", "m4a"].includes(extension ?? "")) return "audio";
  if (["vtt", "srt"].includes(extension ?? "")) return "caption";
  return "other";
}

type NasaClientOptions = {
  apiKey: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
};

export class NasaClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: NasaClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async getApod(date: string): Promise<Apod> {
    const url = new URL("https://api.nasa.gov/planetary/apod");
    url.search = new URLSearchParams({
      api_key: this.options.apiKey,
      date,
      thumbs: "true",
    }).toString();

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        headers: {
          accept: "application/json",
          "user-agent": "NASA-Mission-Control/0.1",
        },
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.name === "TimeoutError"
          ? "NASA did not respond in time."
          : "NASA is currently unreachable.";
      throw new HttpError(503, "UPSTREAM_UNAVAILABLE", message);
    }

    if (!response.ok) {
      if (response.status === 429)
        throw new HttpError(
          503,
          "RATE_LIMITED",
          "NASA request capacity has been reached. Please retry later.",
        );
      if (response.status === 404)
        throw new HttpError(
          404,
          "NOT_FOUND",
          "No Astronomy Picture of the Day was found for that date.",
        );
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA could not fulfill this request. Please retry shortly.",
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned an unexpected response.",
      );
    }

    const parsed = nasaApodSchema.safeParse(await response.json());
    if (!parsed.success)
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned data in an unexpected format.",
      );
    const item = parsed.data;
    const copyright = item.copyright?.trim();
    return {
      date: item.date,
      title: item.title,
      explanation: item.explanation,
      mediaType: item.media_type,
      mediaUrl: item.url,
      hdUrl: item.hdurl ?? null,
      thumbnailUrl: item.thumbnail_url ?? null,
      copyright: copyright === "" ? null : (copyright ?? null),
    };
  }

  async getAsteroidFeed(
    startDate: string,
    endDate: string,
  ): Promise<AsteroidFeed> {
    const url = new URL("https://api.nasa.gov/neo/rest/v1/feed");
    url.search = new URLSearchParams({
      api_key: this.options.apiKey,
      start_date: startDate,
      end_date: endDate,
    }).toString();
    const response = await this.requestJson(url);
    const parsed = nasaAsteroidFeedSchema.safeParse(response);
    if (!parsed.success) {
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned asteroid data in an unexpected format.",
      );
    }

    const asteroids: Asteroid[] = [];
    for (const [date, items] of Object.entries(
      parsed.data.near_earth_objects,
    )) {
      for (const item of items) {
        const approach = item.close_approach_data.find(
          (candidate) => candidate.close_approach_date === date,
        );
        if (!approach) {
          throw new HttpError(
            502,
            "UPSTREAM_UNAVAILABLE",
            "NASA returned asteroid approach data in an unexpected format.",
          );
        }
        asteroids.push({
          id: item.id,
          name: item.name,
          jplUrl: item.nasa_jpl_url,
          potentiallyHazardous: item.is_potentially_hazardous_asteroid,
          sentryObject: item.is_sentry_object,
          diameterMeters: {
            min: item.estimated_diameter.meters.estimated_diameter_min,
            max: item.estimated_diameter.meters.estimated_diameter_max,
          },
          approach: {
            date: approach.close_approach_date,
            dateTimeUtc: new Date(
              approach.epoch_date_close_approach,
            ).toISOString(),
            velocityKph: approach.relative_velocity.kilometers_per_hour,
            missDistanceKm: approach.miss_distance.kilometers,
            missDistanceLunar: approach.miss_distance.lunar,
          },
        });
      }
    }
    asteroids.sort(
      (first, second) =>
        first.approach.dateTimeUtc.localeCompare(second.approach.dateTimeUtc) ||
        first.id.localeCompare(second.id),
    );
    return {
      startDate,
      endDate,
      totalCount: asteroids.length,
      potentiallyHazardousCount: asteroids.filter(
        (item) => item.potentiallyHazardous,
      ).length,
      closestApproachKm:
        asteroids.length === 0
          ? null
          : Math.min(...asteroids.map((item) => item.approach.missDistanceKm)),
      asteroids,
    };
  }

  async searchMedia(
    query: string,
    mediaType: MediaType | "all",
    page: number,
    pageSize: number,
  ): Promise<MediaSearch> {
    const url = new URL("https://images-api.nasa.gov/search");
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      page_size: String(pageSize),
    });
    if (mediaType !== "all") params.set("media_type", mediaType);
    url.search = params.toString();
    const parsed = mediaSearchSchema.safeParse(await this.requestJson(url));
    if (!parsed.success) {
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned media search data in an unexpected format.",
      );
    }
    const totalHits = parsed.data.collection.metadata.total_hits;
    return {
      query,
      mediaType,
      page,
      pageSize,
      totalHits,
      totalPages: Math.max(1, Math.ceil(totalHits / pageSize)),
      items: parsed.data.collection.items.map(normalizeMediaItem),
    };
  }

  async getMediaDetail(nasaId: string): Promise<MediaDetail> {
    const searchUrl = new URL("https://images-api.nasa.gov/search");
    searchUrl.search = new URLSearchParams({ nasa_id: nasaId }).toString();
    const manifestUrl = new URL(
      `https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`,
    );
    const [searchResponse, manifestResponse] = await Promise.all([
      this.requestJson(searchUrl),
      this.requestJson(manifestUrl),
    ]);
    const search = mediaSearchSchema.safeParse(searchResponse);
    const manifest = mediaManifestSchema.safeParse(manifestResponse);
    const result = search.success ? search.data.collection.items[0] : undefined;
    if (!result || !manifest.success) {
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned media asset data in an unexpected format.",
      );
    }
    const item = normalizeMediaItem(result);
    const assets = manifest.data.collection.items
      .map(({ href }) => ({
        url: href,
        label: decodeURIComponent(
          new URL(href).pathname.split("/").pop() ?? href,
        ),
        kind: assetKind(href),
      }))
      .filter((asset) => asset.kind !== "other");
    const playableKind = item.mediaType === "image" ? "image" : item.mediaType;
    const playableAssets = assets.filter(
      (asset) => asset.kind === playableKind,
    );
    const original = playableAssets.find((asset) => /~orig\./i.test(asset.url));
    const playback =
      item.mediaType === "image"
        ? playableAssets.find((asset) => /~medium\.|~large\./i.test(asset.url))
        : playableAssets.find((asset) => /~small\.|~medium\./i.test(asset.url));
    return {
      ...item,
      assets,
      playbackUrl:
        playback?.url ?? original?.url ?? playableAssets[0]?.url ?? null,
      downloadUrl: original?.url ?? playableAssets[0]?.url ?? null,
    };
  }

  private async requestJson(url: URL): Promise<unknown> {
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        headers: {
          accept: "application/json",
          "user-agent": "NASA-Mission-Control/0.2",
        },
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.name === "TimeoutError"
          ? "NASA did not respond in time."
          : "NASA is currently unreachable.";
      throw new HttpError(503, "UPSTREAM_UNAVAILABLE", message);
    }
    if (!response.ok) {
      if (response.status === 429)
        throw new HttpError(
          503,
          "RATE_LIMITED",
          "NASA request capacity has been reached. Please retry later.",
        );
      if (response.status === 404)
        throw new HttpError(
          404,
          "NOT_FOUND",
          "NASA did not find data for this request.",
        );
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA could not fulfill this request. Please retry shortly.",
      );
    }
    if (
      !(response.headers.get("content-type") ?? "").includes("application/json")
    ) {
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned an unexpected response.",
      );
    }
    return (await response.json()) as unknown;
  }
}

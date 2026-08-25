import { z } from "zod";
import type {
  Apod,
  Asteroid,
  AsteroidFeed,
  EarthCollection,
  EarthObservation,
  MediaAsset,
  MediaDetail,
  MediaItem,
  MediaSearch,
  MediaType,
  SpaceWeatherCategory,
  SpaceWeatherEvent,
  SpaceWeatherFeed,
} from "@mission-control/shared";
import { HttpError } from "./http-error.js";
import { logger } from "./logger.js";
import {
  CircuitBreaker,
  reliability,
  type UpstreamFailure,
} from "./reliability.js";

const nasaApodSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.enum(["image", "video"]),
  url: z.string().url(),
  hdurl: z.string().url().optional(),
  thumbnail_url: z.union([z.string().url(), z.literal("")]).optional(),
  copyright: z.string().optional(),
});

const epicImageSchema = z.object({
  identifier: z.string().min(1),
  caption: z.string().min(1),
  image: z.string().min(1),
  date: z.string(),
  centroid_coordinates: z.object({
    lat: z.number().finite(),
    lon: z.number().finite(),
  }),
});
const epicAvailableSchema = z.array(z.object({ date: z.string() })).min(1);

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

const donkiInstrumentSchema = z.object({ displayName: z.string().min(1) });
const donkiLinkedEventSchema = z.object({ activityID: z.string().min(1) });
const donkiBaseSchema = z.object({
  instruments: z.array(donkiInstrumentSchema).optional().default([]),
  sourceLocation: z.string().nullable().optional(),
  activeRegionNum: z.number().int().nullable().optional(),
  note: z.string().nullable().optional(),
  link: z.string().url(),
  linkedEvents: z.array(donkiLinkedEventSchema).nullable().optional(),
});
const donkiFlareSchema = donkiBaseSchema.extend({
  flrID: z.string().min(1),
  beginTime: z.string(),
  peakTime: z.string(),
  endTime: z.string().nullable().optional(),
  classType: z.string().nullable().optional(),
});
const donkiCmeAnalysisSchema = z.object({
  isMostAccurate: z.boolean(),
  speed: z.number().nonnegative().nullable().optional(),
  halfAngle: z.number().nonnegative().nullable().optional(),
  type: z.string().nullable().optional(),
});
const donkiCmeSchema = donkiBaseSchema.extend({
  activityID: z.string().min(1),
  startTime: z.string(),
  cmeAnalyses: z.array(donkiCmeAnalysisSchema).nullable().optional(),
});
const donkiKpSchema = z.object({
  observedTime: z.string(),
  kpIndex: z.number().min(0).max(9),
  source: z.string().min(1),
});
const donkiStormSchema = z.object({
  gstID: z.string().min(1),
  startTime: z.string(),
  allKpIndex: z.array(donkiKpSchema),
  link: z.string().url(),
  linkedEvents: z.array(donkiLinkedEventSchema).nullable().optional(),
});

function utcInstant(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    throw new HttpError(
      502,
      "UPSTREAM_UNAVAILABLE",
      "NASA returned a space weather timestamp in an unexpected format.",
    );
  }
  return parsed.toISOString();
}

function linkedIds(
  events: z.infer<typeof donkiLinkedEventSchema>[] | null | undefined,
): string[] {
  return events?.map((event) => event.activityID) ?? [];
}

function kpDescription(kp: number): string {
  if (kp >= 9) return "Extreme observed geomagnetic activity";
  if (kp >= 8) return "Severe observed geomagnetic activity";
  if (kp >= 7) return "Strong observed geomagnetic activity";
  if (kp >= 6) return "Moderate observed geomagnetic activity";
  if (kp >= 5) return "Minor observed geomagnetic activity";
  return "Below geomagnetic storm level";
}

function textOrFallback(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === "" ? fallback : trimmed;
}

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
  private readonly breaker = new CircuitBreaker();

  constructor(private readonly options: NasaClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async fetchUpstream(url: URL): Promise<Response> {
    const upstream = url.hostname;
    reliability.request(upstream);
    if (!this.breaker.permit(upstream)) {
      reliability.failure(upstream, "circuit_open");
      throw new HttpError(
        503,
        "UPSTREAM_UNAVAILABLE",
        "NASA is temporarily isolated after repeated failures. Please retry shortly.",
      );
    }
    const startedAt = performance.now();
    try {
      const response = await this.fetchImpl(url, {
        headers: {
          accept: "application/json",
          "user-agent": "NASA-Mission-Control/1.0.0",
        },
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
      logger.info("upstream.request_complete", {
        upstream: url.hostname,
        upstreamPath: url.pathname,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
        outcome: response.ok ? "success" : "http_error",
      });
      if (response.ok) {
        this.breaker.success(upstream);
        reliability.success(upstream);
      } else {
        const category: UpstreamFailure =
          response.status === 429
            ? "rate_limit"
            : response.status >= 500
              ? "http_5xx"
              : "http_4xx";
        reliability.failure(upstream, category);
        if (response.status === 429 || response.status >= 500)
          this.breaker.failure(upstream);
        else this.breaker.success(upstream);
      }
      return response;
    } catch (error: unknown) {
      if (error instanceof HttpError) throw error;
      const category: UpstreamFailure =
        error instanceof Error && error.name === "TimeoutError"
          ? "timeout"
          : "network";
      reliability.failure(upstream, category);
      this.breaker.failure(upstream);
      logger.error("upstream.request_failed", {
        upstream: url.hostname,
        upstreamPath: url.pathname,
        durationMs: Math.round(performance.now() - startedAt),
        outcome:
          error instanceof Error && error.name === "TimeoutError"
            ? "timeout"
            : "network_error",
      });
      throw error;
    }
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
      response = await this.fetchUpstream(url);
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

    const parsed = nasaApodSchema.safeParse(
      await this.parseJson(response, url),
    );
    if (!parsed.success) {
      this.schemaDrift(url, parsed.error.issues);
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned data in an unexpected format.",
      );
    }
    const item = parsed.data;
    const copyright = item.copyright?.trim();
    return {
      date: item.date,
      title: item.title,
      explanation: item.explanation,
      mediaType: item.media_type,
      mediaUrl: item.url,
      hdUrl: item.hdurl ?? null,
      thumbnailUrl:
        item.thumbnail_url === "" ? null : (item.thumbnail_url ?? null),
      copyright: copyright === "" ? null : (copyright ?? null),
    };
  }

  async getEarthObservation(
    collection: EarthCollection,
    requestedDate?: string,
  ): Promise<EarthObservation> {
    const availableUrl = new URL(
      `https://epic.gsfc.nasa.gov/api/${collection}/all`,
    );
    const available = epicAvailableSchema.safeParse(
      await this.requestJson(availableUrl),
    );
    if (!available.success) {
      this.schemaDrift(availableUrl, available.error.issues);
      this.earthFormatError();
    }
    const latestAvailableDate = available.data[0]?.date.slice(0, 10);
    if (!latestAvailableDate) this.earthFormatError();
    const date = requestedDate ?? latestAvailableDate;
    const imagesUrl = new URL(
      `https://epic.gsfc.nasa.gov/api/${collection}/date/${date}`,
    );
    const imageListSchema = z.array(epicImageSchema);
    let images = imageListSchema.safeParse(await this.requestJson(imagesUrl));
    const dateIsListed = available.data.some(
      (item) => item.date.slice(0, 10) === date,
    );
    if (images.success && images.data.length === 0 && dateIsListed) {
      images = imageListSchema.safeParse(await this.requestJson(imagesUrl));
    }
    if (!images.success) {
      this.schemaDrift(imagesUrl, images.error.issues);
      this.earthFormatError();
    }
    if (images.data.length === 0 && dateIsListed) {
      throw new HttpError(
        503,
        "UPSTREAM_UNAVAILABLE",
        "NASA temporarily returned an incomplete Earth observation. Please retry.",
      );
    }
    const archiveCollection = collection === "natural" ? "natural" : "enhanced";
    const normalized = images.data.map((item) => {
      const captured = new Date(`${item.date.replace(" ", "T")}Z`);
      if (Number.isNaN(captured.valueOf())) this.earthFormatError();
      const [year, month, day] = item.date.slice(0, 10).split("-");
      if (!year || !month || !day) this.earthFormatError();
      const archive = `https://epic.gsfc.nasa.gov/archive/${archiveCollection}/${year}/${month}/${day}`;
      return {
        id: item.identifier,
        caption: item.caption,
        capturedAtUtc: captured.toISOString(),
        centroid: {
          latitude: item.centroid_coordinates.lat,
          longitude: item.centroid_coordinates.lon,
        },
        imageUrl: `${archive}/jpg/${item.image}.jpg`,
        thumbnailUrl: `${archive}/thumbs/${item.image}.jpg`,
        downloadUrl: `${archive}/png/${item.image}.png`,
      };
    });
    const gibs = new URL(
      "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    );
    gibs.search = new URLSearchParams({
      SERVICE: "WMS",
      REQUEST: "GetMap",
      VERSION: "1.3.0",
      LAYERS: "MODIS_Terra_CorrectedReflectance_TrueColor",
      STYLES: "",
      FORMAT: "image/jpeg",
      TRANSPARENT: "false",
      HEIGHT: "900",
      WIDTH: "1800",
      CRS: "EPSG:4326",
      BBOX: "-90,-180,90,180",
      TIME: date,
    }).toString();
    return {
      date,
      latestAvailableDate,
      collection,
      images: normalized,
      dailyComposite: {
        title: "MODIS Terra corrected-reflectance true color",
        layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
        imageUrl: gibs.toString(),
        sourceUrl: "https://earthdata.nasa.gov/data/tools/gibs",
      },
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
      this.schemaDrift(url, parsed.error.issues);
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
      this.schemaDrift(url, parsed.error.issues);
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
      const issues = !search.success
        ? search.error.issues
        : !manifest.success
          ? manifest.error.issues
          : [];
      this.schemaDrift(searchUrl, issues);
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

  async getSpaceWeather(
    startDate: string,
    endDate: string,
    category: SpaceWeatherCategory | "all",
  ): Promise<SpaceWeatherFeed> {
    const categories: SpaceWeatherCategory[] =
      category === "all" ? ["flare", "cme", "storm"] : [category];
    const endpoint: Record<SpaceWeatherCategory, string> = {
      flare: "FLR",
      cme: "CME",
      storm: "GST",
    };
    const responses = await Promise.all(
      categories.map(async (eventCategory) => {
        const url = new URL(
          `https://api.nasa.gov/DONKI/${endpoint[eventCategory]}`,
        );
        url.search = new URLSearchParams({
          startDate,
          endDate,
          api_key: this.options.apiKey,
        }).toString();
        return {
          category: eventCategory,
          data: await this.requestJson(url),
          url,
        };
      }),
    );
    const events: SpaceWeatherEvent[] = [];
    for (const response of responses) {
      if (response.category === "flare") {
        const parsed = z.array(donkiFlareSchema).safeParse(response.data);
        if (!parsed.success) {
          this.schemaDrift(response.url, parsed.error.issues);
          this.spaceWeatherFormatError();
        }
        for (const event of parsed.data) {
          const classType = textOrFallback(event.classType, "unclassified");
          events.push({
            id: event.flrID,
            category: "flare",
            title: `Solar flare ${classType}`,
            startTimeUtc: utcInstant(event.beginTime),
            endTimeUtc: event.endTime ? utcInstant(event.endTime) : null,
            location: event.sourceLocation ?? null,
            activeRegion: event.activeRegionNum ?? null,
            instruments: event.instruments.map((item) => item.displayName),
            summary: textOrFallback(
              event.note,
              "A burst of electromagnetic radiation observed from the Sun.",
            ),
            measurements: [
              {
                label: "Flare class",
                value: classType,
                explanation: "GOES X-ray classification reported by DONKI.",
              },
              {
                label: "Peak time",
                value: utcInstant(event.peakTime),
                explanation: "Time of maximum reported X-ray intensity.",
              },
            ],
            linkedEventIds: linkedIds(event.linkedEvents),
            sourceUrl: event.link,
          });
        }
      } else if (response.category === "cme") {
        const parsed = z.array(donkiCmeSchema).safeParse(response.data);
        if (!parsed.success) {
          this.schemaDrift(response.url, parsed.error.issues);
          this.spaceWeatherFormatError();
        }
        for (const event of parsed.data) {
          const analysis =
            event.cmeAnalyses?.find((item) => item.isMostAccurate) ??
            event.cmeAnalyses?.[0];
          const measurements = [];
          if (analysis?.speed != null)
            measurements.push({
              label: "Estimated speed",
              value: `${analysis.speed.toLocaleString("en-US")} km/s`,
              explanation:
                "Modeled radial speed from the selected CME analysis.",
            });
          if (analysis?.halfAngle != null)
            measurements.push({
              label: "Angular width",
              value: `${String(analysis.halfAngle * 2)}°`,
              explanation:
                "Approximate full angular width from the modeled half-angle.",
            });
          events.push({
            id: event.activityID,
            category: "cme",
            title: "Coronal mass ejection",
            startTimeUtc: utcInstant(event.startTime),
            endTimeUtc: null,
            location: event.sourceLocation ?? null,
            activeRegion: event.activeRegionNum ?? null,
            instruments: event.instruments.map((item) => item.displayName),
            summary: textOrFallback(
              event.note,
              "A large release of plasma and magnetic field observed leaving the Sun.",
            ),
            measurements,
            linkedEventIds: linkedIds(event.linkedEvents),
            sourceUrl: event.link,
          });
        }
      } else {
        const parsed = z.array(donkiStormSchema).safeParse(response.data);
        if (!parsed.success) {
          this.schemaDrift(response.url, parsed.error.issues);
          this.spaceWeatherFormatError();
        }
        for (const event of parsed.data) {
          const peak = event.allKpIndex.reduce<z.infer<
            typeof donkiKpSchema
          > | null>(
            (current, item) =>
              !current || item.kpIndex > current.kpIndex ? item : current,
            null,
          );
          events.push({
            id: event.gstID,
            category: "storm",
            title: "Geomagnetic storm observation",
            startTimeUtc: utcInstant(event.startTime),
            endTimeUtc: null,
            location: "Earth",
            activeRegion: null,
            instruments: peak ? [peak.source] : [],
            summary: peak
              ? kpDescription(peak.kpIndex)
              : "Geomagnetic storm activity recorded in DONKI.",
            measurements: peak
              ? [
                  {
                    label: "Peak Kp",
                    value: String(peak.kpIndex),
                    explanation: `${kpDescription(peak.kpIndex)}; observed ${utcInstant(peak.observedTime)}.`,
                  },
                ]
              : [],
            linkedEventIds: linkedIds(event.linkedEvents),
            sourceUrl: event.link,
          });
        }
      }
    }
    events.sort((first, second) =>
      second.startTimeUtc.localeCompare(first.startTimeUtc),
    );
    return {
      startDate,
      endDate,
      category,
      counts: {
        flare: events.filter((event) => event.category === "flare").length,
        cme: events.filter((event) => event.category === "cme").length,
        storm: events.filter((event) => event.category === "storm").length,
      },
      events,
    };
  }

  private spaceWeatherFormatError(): never {
    throw new HttpError(
      502,
      "UPSTREAM_UNAVAILABLE",
      "NASA returned space weather data in an unexpected format.",
    );
  }

  private earthFormatError(): never {
    throw new HttpError(
      502,
      "UPSTREAM_UNAVAILABLE",
      "NASA returned Earth observation data in an unexpected format.",
    );
  }

  private async requestJson(url: URL): Promise<unknown> {
    let response: Response;
    try {
      response = await this.fetchUpstream(url);
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
    return this.parseJson(response, url);
  }

  private schemaDrift(url: URL, issues: z.ZodIssue[]): void {
    reliability.failure(url.hostname, "schema_validation");
    this.breaker.failure(url.hostname);
    logger.error("upstream.schema_drift", {
      upstream: url.hostname,
      upstreamPath: url.pathname,
      issueCount: issues.length,
      firstIssuePath: issues[0]?.path.join(".") ?? "root",
      firstIssueCode: issues[0]?.code ?? "unknown",
    });
  }

  private async parseJson(response: Response, url: URL): Promise<unknown> {
    try {
      return (await response.json()) as unknown;
    } catch {
      reliability.failure(url.hostname, "malformed_json");
      this.breaker.failure(url.hostname);
      throw new HttpError(
        502,
        "UPSTREAM_UNAVAILABLE",
        "NASA returned malformed data. Please retry shortly.",
      );
    }
  }
}

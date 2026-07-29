import { z } from "zod";
import type { Apod, Asteroid, AsteroidFeed } from "@mission-control/shared";
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

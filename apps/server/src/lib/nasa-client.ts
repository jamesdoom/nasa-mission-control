import { z } from "zod";
import type { Apod } from "@mission-control/shared";
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
}

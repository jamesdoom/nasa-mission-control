export type ApodMediaType = "image" | "video";

export type Apod = {
  date: string;
  title: string;
  explanation: string;
  mediaType: ApodMediaType;
  mediaUrl: string;
  hdUrl: string | null;
  thumbnailUrl: string | null;
  copyright: string | null;
};

export const APOD_EARLIEST_DATE = "1995-06-16";

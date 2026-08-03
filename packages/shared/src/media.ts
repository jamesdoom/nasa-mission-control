export type MediaType = "image" | "video" | "audio";

export type MediaItem = {
  nasaId: string;
  title: string;
  description: string;
  mediaType: MediaType;
  dateCreated: string;
  center: string | null;
  photographer: string | null;
  keywords: string[];
  previewUrl: string | null;
};

export type MediaSearch = {
  query: string;
  mediaType: MediaType | "all";
  page: number;
  pageSize: number;
  totalHits: number;
  totalPages: number;
  items: MediaItem[];
};

export type MediaAsset = {
  url: string;
  label: string;
  kind: "image" | "video" | "audio" | "caption" | "other";
};

export type MediaDetail = MediaItem & {
  assets: MediaAsset[];
  playbackUrl: string | null;
  downloadUrl: string | null;
};

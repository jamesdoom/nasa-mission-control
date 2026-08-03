export type EarthCollection = "natural" | "enhanced";

export type EarthImage = {
  id: string;
  caption: string;
  capturedAtUtc: string;
  centroid: { latitude: number; longitude: number };
  imageUrl: string;
  thumbnailUrl: string;
  downloadUrl: string;
};

export type EarthObservation = {
  date: string;
  latestAvailableDate: string;
  collection: EarthCollection;
  images: EarthImage[];
  dailyComposite: {
    title: string;
    layer: string;
    imageUrl: string;
    sourceUrl: string;
  };
};

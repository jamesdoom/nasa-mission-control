import entries from "../data/pageMetadata.json";

const metadataByPath: Partial<
  Record<string, { title: string; description: string }>
> = entries;

export function updatePageMetadata(pathname: string, title: string) {
  const base = `/${pathname.split("/").find(Boolean) ?? ""}`;
  const entry =
    metadataByPath[pathname] ?? metadataByPath[base] ?? entries["/"];
  const url = `https://nasa-mission-control-alpha.vercel.app${pathname}`;
  function meta(key: string, content: string, property = false) {
    const attribute = property ? "property" : "name";
    let element = document.querySelector<HTMLMetaElement>(
      `meta[${attribute}="${key}"]`,
    );
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.append(element);
    }
    element.content = content;
  }
  meta("description", entry.description);
  meta("og:type", "website", true);
  meta("og:site_name", "NASA Mission Control", true);
  meta(
    "og:image",
    "https://nasa-mission-control-alpha.vercel.app/assets/missions/webb.jpg",
    true,
  );
  meta("og:image:alt", "NASA imagery representing space exploration", true);
  meta("twitter:card", "summary_large_image");
  meta(
    "twitter:image",
    "https://nasa-mission-control-alpha.vercel.app/assets/missions/webb.jpg",
  );
  meta("og:title", `${title} | NASA Mission Control`, true);
  meta("og:description", entry.description, true);
  meta("og:url", url, true);
  meta("twitter:title", `${title} | NASA Mission Control`);
  meta("twitter:description", entry.description);
  meta(
    "robots",
    base === "/favorites" || base === "/investigate"
      ? "noindex,follow"
      : "index,follow",
  );
  let canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = url;
}

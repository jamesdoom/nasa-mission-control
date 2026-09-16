import { readFile, writeFile, mkdir } from "node:fs/promises";

const root = new URL("../apps/client/dist/", import.meta.url);
const entries = JSON.parse(
  await readFile(
    new URL("../apps/client/src/data/pageMetadata.json", import.meta.url),
    "utf8",
  ),
);
const template = await readFile(new URL("index.html", root), "utf8");
const origin = "https://nasa-mission-control-alpha.vercel.app";
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const [pathname, entry] of Object.entries(entries)) {
  const title = escape(`${entry.title} | NASA Mission Control`);
  const description = escape(entry.description);
  const url = origin + pathname;
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${url}" />
    <meta name="robots" content="${pathname === "/favorites" || pathname === "/investigate" ? "noindex,follow" : "index,follow"}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="NASA Mission Control" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${origin}/assets/missions/webb.jpg" />
    <meta property="og:image:alt" content="NASA imagery representing space exploration" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${origin}/assets/missions/webb.jpg" />
    </head>`,
    );
  const directory = new URL(pathname === "/" ? "./" : "_entries/", root);
  await mkdir(directory, { recursive: true });
  await writeFile(
    new URL(
      pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`,
      directory,
    ),
    html,
  );
}
console.log(
  `Generated metadata for ${Object.keys(entries).length} entry pages.`,
);

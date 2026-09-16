import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("built entry pages expose sharing metadata without JavaScript and have matching rewrites", async () => {
  const entries = JSON.parse(
    await readFile("apps/client/src/data/pageMetadata.json", "utf8"),
  );
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  for (const [route, entry] of Object.entries(entries)) {
    const path = route === "/" ? "/index.html" : `/_entries${route}.html`;
    const html = await readFile(`apps/client/dist${path}`, "utf8");
    assert.ok(
      html.includes(`<title>${entry.title} | NASA Mission Control</title>`),
      route,
    );
    assert.ok(html.includes(`content="${entry.description}"`), route);
    assert.ok(
      html.includes(
        `rel="canonical" href="https://nasa-mission-control-alpha.vercel.app${route}"`,
      ),
      route,
    );
    assert.equal((html.match(/name="description"/g) ?? []).length, 1);
    assert.ok(html.includes('property="og:image"'));
    assert.ok(
      html.includes('name="twitter:card" content="summary_large_image"'),
    );
    if (route !== "/")
      assert.equal(
        config.rewrites.find((rewrite) => rewrite.source === route)
          ?.destination,
        path,
      );
  }
  assert.equal(config.rewrites.at(-1).destination, "/index.html");
  const image = await readFile("apps/client/dist/assets/missions/webb.jpg");
  assert.equal(image[0], 0xff);
  assert.equal(image[1], 0xd8);
});

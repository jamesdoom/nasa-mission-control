import { describe, expect, it, vi } from "vitest";
import { NasaClient } from "../lib/nasa-client.js";

const record = {
  date: "2026-10-01",
  title: "Moon &amp; Etna",
  explanation:
    '<strong>Explanation:</strong> A <a href="https://example.com">moon</a>.<br>Next paragraph. <script>unwanted()</script>',
  copyright: '<a href="https://example.com">Dario &amp; team</a>',
  media_type: "image",
  url: "https://science.nasa.gov/image-article/example/",
  hdurl: "https://assets.science.nasa.gov/moon.jpg",
};

function client(payload: unknown) {
  const fetchImpl = vi.fn().mockResolvedValue(Response.json(payload));
  return {
    fetchImpl,
    nasa: new NasaClient({ apiKey: "secret", timeoutMs: 1000, fetchImpl }),
  };
}

describe("NASA Science APOD migration", () => {
  it("uses the public dated endpoint and normalizes media and HTML as plain text", async () => {
    const { nasa, fetchImpl } = client(record);
    await expect(nasa.getApod(record.date)).resolves.toMatchObject({
      title: "Moon & Etna",
      explanation: "A moon. Next paragraph.",
      copyright: "Dario & team",
      mediaUrl: record.hdurl,
      hdUrl: record.hdurl,
    });
    expect(String(fetchImpl.mock.calls[0]?.[0])).toBe(
      "https://science.nasa.gov/wp-json/wp/v2/apod-basic/261001",
    );
  });

  it.each([
    [
      "video",
      '<video><source src="https://assets.science.nasa.gov/movie.mp4"></video>',
      "https://assets.science.nasa.gov/movie.mp4",
    ],
    [
      "iframe",
      '<iframe src="//www.youtube.com/embed/example?x=1&amp;y=2"></iframe>',
      "https://www.youtube.com/embed/example?x=1&y=2",
    ],
  ])(
    "extracts %s media rather than the article or poster",
    async (media_type, basic_html, mediaUrl) => {
      const { nasa } = client({ ...record, media_type, basic_html });
      await expect(nasa.getApod(record.date)).resolves.toMatchObject({
        mediaType: "video",
        mediaUrl,
        thumbnailUrl: record.hdurl,
        hdUrl: null,
      });
    },
  );

  it.each([
    { ...record, hdurl: null },
    { ...record, date: "2026-09-30" },
    {
      ...record,
      media_type: "iframe",
      basic_html: '<iframe src="javascript:alert(1)"></iframe>',
    },
    { ...record, media_type: "video", basic_html: "<video></video>" },
  ])("rejects incomplete, unsafe, or wrong-date media", async (payload) => {
    await expect(
      client(payload).nasa.getApod(record.date),
    ).rejects.toMatchObject({ status: 502, code: "UPSTREAM_UNAVAILABLE" });
  });
});

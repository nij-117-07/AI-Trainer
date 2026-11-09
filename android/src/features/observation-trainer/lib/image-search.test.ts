// src/features/observation-trainer/lib/image-search.test.ts
import { parseCommonsResults } from "./image-search";

function page(overrides: Record<string, unknown> = {}, info: Record<string, unknown> = {}) {
  return {
    pageid: 101,
    title: "File:Street_market_at_dusk.jpg",
    index: 1,
    imageinfo: [
      {
        url: "https://upload.wikimedia.org/original.jpg",
        thumburl: "https://upload.wikimedia.org/thumb/1024px.jpg",
        thumbwidth: 1024,
        thumbheight: 768,
        descriptionurl: "https://commons.wikimedia.org/wiki/File:Street_market_at_dusk.jpg",
        mime: "image/jpeg",
        extmetadata: {
          LicenseShortName: { value: "CC BY-SA 4.0" },
          Artist: { value: '<a href="x">Jane Doe</a>' },
        },
        ...info,
      },
    ],
    ...overrides,
  };
}

describe("parseCommonsResults", () => {
  it("maps a Commons page to a candidate with credit details", () => {
    expect(parseCommonsResults({ query: { pages: [page()] } })).toEqual([
      {
        id: "101",
        title: "Street market at dusk",
        imageUrl: "https://upload.wikimedia.org/thumb/1024px.jpg",
        width: 1024,
        height: 768,
        pageUrl: "https://commons.wikimedia.org/wiki/File:Street_market_at_dusk.jpg",
        license: "CC BY-SA 4.0",
        artist: "Jane Doe",
      },
    ]);
  });

  it("orders results by relevance index", () => {
    const payload = {
      query: {
        pages: [page({ pageid: 2, index: 2, title: "File:B.jpg" }), page({ pageid: 1, index: 1, title: "File:A.jpg" })],
      },
    };
    expect(parseCommonsResults(payload).map((item) => item.id)).toEqual(["1", "2"]);
  });

  it("skips files that are not JPEG, PNG, or WebP", () => {
    expect(parseCommonsResults({ query: { pages: [page({}, { mime: "image/svg+xml" })] } })).toEqual([]);
  });

  it("skips entries without an https image address", () => {
    expect(
      parseCommonsResults({ query: { pages: [page({}, { thumburl: undefined, url: "http://insecure.jpg" })] } }),
    ).toEqual([]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(parseCommonsResults({ batchcomplete: true })).toEqual([]);
    expect(parseCommonsResults(null)).toEqual([]);
  });
});

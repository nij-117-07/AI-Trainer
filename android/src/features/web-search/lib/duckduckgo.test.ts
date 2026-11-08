// src/features/web-search/lib/duckduckgo.test.ts
import {
  buildHtmlBody,
  buildLiteBody,
  extractVqd,
  looksLikeChallenge,
  parseDuckDuckGoHtml,
  parseDuckDuckGoLite,
} from "./duckduckgo";
import type { SearchRequest } from "../types";

const HTML_PAGE = `
<html><head><script>var vqd='4-123456789012345678901234567890';</script></head><body>
<div class="result results_links">
  <h2 class="result__title">
    <a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fdocs.expo.dev%2Frouter%2F&amp;rut=abc">Expo <b>Router</b> &amp; docs</a>
  </h2>
  <a class="result__snippet" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fdocs.expo.dev%2Frouter%2F">File-based &quot;routing&quot; for Expo.</a>
</div>
<div class="result">
  <a class="result__a" href="https://duckduckgo.com/y.js?ad_provider=bing">Sponsored thing</a>
  <a class="result__snippet" href="#">Ad copy</a>
</div>
<div class="result">
  <a class="result__a" href="https://www.example.org/page">Example page</a>
  <a class="result__snippet" href="#">An example&#39;s snippet.</a>
</div>
<div class="result">
  <a class="result__a" href="https://docs.expo.dev/router/">Duplicate of the first</a>
</div>
</body></html>`;

const LITE_PAGE = `
<table>
<tr><td><a rel="nofollow" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fnodejs.org%2Fen&amp;rut=1" class='result-link'>Node.js</a></td></tr>
<tr><td class='result-snippet'>JavaScript runtime <b>built</b> on V8.</td></tr>
<tr><td><a href="https://deno.land/" class="result-link">Deno</a></td></tr>
<tr><td class='result-snippet'>A secure runtime.</td></tr>
</table>`;

const baseRequest: SearchRequest = {
  query: "expo router",
  engine: "duckduckgo",
  resultCount: 10,
  region: "us-en",
  timeRange: "any",
  safeSearch: "-1",
  page: 1,
};

describe("parseDuckDuckGoHtml", () => {
  it("reads titles, unwrapped links, and snippets, skipping ads and duplicates", () => {
    expect(parseDuckDuckGoHtml(HTML_PAGE, 10)).toEqual([
      {
        title: "Expo Router & docs",
        url: "https://docs.expo.dev/router/",
        host: "docs.expo.dev",
        snippet: 'File-based "routing" for Expo.',
      },
      {
        title: "Example page",
        url: "https://www.example.org/page",
        host: "example.org",
        snippet: "An example's snippet.",
      },
    ]);
  });

  it("caps the number of results at the limit", () => {
    expect(parseDuckDuckGoHtml(HTML_PAGE, 1)).toHaveLength(1);
  });

  it("returns an empty list for markup without result anchors", () => {
    expect(parseDuckDuckGoHtml("<html><body>nothing</body></html>", 10)).toEqual([]);
  });
});

describe("parseDuckDuckGoLite", () => {
  it("reads result-link anchors with the following result-snippet cell", () => {
    expect(parseDuckDuckGoLite(LITE_PAGE, 10)).toEqual([
      { title: "Node.js", url: "https://nodejs.org/en", host: "nodejs.org", snippet: "JavaScript runtime built on V8." },
      { title: "Deno", url: "https://deno.land/", host: "deno.land", snippet: "A secure runtime." },
    ]);
  });
});

describe("extractVqd", () => {
  it("reads the session token from the page", () => {
    expect(extractVqd(HTML_PAGE)).toBe("4-123456789012345678901234567890");
  });

  it("returns undefined when the token is absent", () => {
    expect(extractVqd("<html></html>")).toBeUndefined();
  });
});

describe("looksLikeChallenge", () => {
  it("flags anomaly and captcha pages near the top", () => {
    expect(looksLikeChallenge("<title>Anomaly detected</title>")).toBe(true);
    expect(looksLikeChallenge("<p>Please solve the CAPTCHA</p>")).toBe(true);
    expect(looksLikeChallenge(HTML_PAGE)).toBe(false);
  });
});

describe("request bodies", () => {
  it("builds the first html page with region, safe search, and the age filter", () => {
    expect(buildHtmlBody({ ...baseRequest, timeRange: "w" }, 10)).toBe(
      "q=expo%20router&kl=us-en&df=w&kp=-1",
    );
  });

  it("continues with offset, next index, and the vqd token on later pages", () => {
    const body = buildHtmlBody({ ...baseRequest, page: 3, vqd: "4-999" }, 10);
    expect(body).toContain("s=20");
    expect(body).toContain("dc=21");
    expect(body).toContain("vqd=4-999");
  });

  it("builds the lite body without the age filter", () => {
    expect(buildLiteBody({ ...baseRequest, timeRange: "d", page: 2 }, 5)).toBe(
      "q=expo%20router&kl=us-en&kp=-1&s=5",
    );
  });
});

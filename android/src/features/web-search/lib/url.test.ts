// src/features/web-search/lib/url.test.ts
import { cleanText, toHost, unwrapResultUrl } from "./url";

describe("unwrapResultUrl", () => {
  it("unwraps a DuckDuckGo redirect to the destination", () => {
    const href =
      "//duckduckgo.com/l/?uddg=https%3A%2F%2Fdocs.expo.dev%2Frouter%2Fintroduction%2F&amp;rut=abc123";
    expect(unwrapResultUrl(href)).toBe("https://docs.expo.dev/router/introduction/");
  });

  it("keeps a plain https link unchanged", () => {
    expect(unwrapResultUrl("https://example.com/page?a=1")).toBe("https://example.com/page?a=1");
  });

  it("turns protocol-relative links into https", () => {
    expect(unwrapResultUrl("//example.com/x")).toBe("https://example.com/x");
  });

  it("drops sponsored redirects", () => {
    expect(unwrapResultUrl("https://duckduckgo.com/y.js?ad_provider=bing")).toBeNull();
  });

  it("drops non-web schemes", () => {
    expect(unwrapResultUrl("javascript:alert(1)")).toBeNull();
    expect(unwrapResultUrl("/relative/path")).toBeNull();
  });

  it("drops a redirect with a malformed escape", () => {
    expect(unwrapResultUrl("//duckduckgo.com/l/?uddg=%E0%A4%A")).toBeNull();
  });
});

describe("cleanText", () => {
  it("strips tags and decodes entities once", () => {
    expect(cleanText("<b>Fish</b> &amp; &quot;chips&quot;&nbsp;&#39;now&#39;")).toBe("Fish & \"chips\" 'now'");
  });

  it("does not double-decode an escaped entity", () => {
    expect(cleanText("&amp;lt;")).toBe("&lt;");
  });
});

describe("toHost", () => {
  it("returns the hostname without www", () => {
    expect(toHost("https://www.example.org/a/b")).toBe("example.org");
  });

  it("returns an empty string for a malformed URL", () => {
    expect(toHost("not a url")).toBe("");
  });
});

// src/features/rss/lib/rss-parser.test.ts
import { parseFeedXml } from "./rss-parser";

const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE rss>
<!-- generated for tests -->
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Example News</title>
    <link>https://news.example.com</link>
    <description>Daily updates</description>
    <item>
      <title>Tom &amp; Jerry</title>
      <link>https://news.example.com/tom</link>
      <guid isPermaLink="false">guid-1</guid>
      <pubDate>Tue, 03 Jun 2025 10:00:00 GMT</pubDate>
      <description><![CDATA[<p>Hello <b>world</b></p>]]></description>
      <content:encoded><![CDATA[<p>Full body</p>]]></content:encoded>
      <dc:creator>Ada</dc:creator>
      <category>Tech</category>
      <category>AI</category>
      <enclosure url="https://cdn.example.com/a.mp3" type="audio/mpeg" length="1" />
    </item>
    <item>
      <title><![CDATA[Fast & Simple]]></title>
      <description>Plain text only</description>
      <media:content url="https://cdn.example.com/pic.jpg" medium="image" />
    </item>
    <item>
      <title>Bare</title>
      <pubDate>not a date</pubDate>
    </item>
  </channel>
</rss>`;

const ATOM_FIXTURE = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Blog</title>
  <subtitle>Notes</subtitle>
  <link rel="alternate" href="https://blog.example.org/"/>
  <link rel="self" href="https://blog.example.org/atom.xml"/>
  <entry>
    <title>First Post</title>
    <id>tag:blog.example.org,2025:1</id>
    <link rel="alternate" href="https://blog.example.org/first"/>
    <published>2025-05-01T08:00:00Z</published>
    <updated>2025-05-02T09:30:00+02:00</updated>
    <author><name>Grace</name></author>
    <category term="Science"/>
    <summary type="html">&lt;p&gt;Short &amp; sweet&lt;/p&gt;</summary>
    <content type="html">&lt;p&gt;Long body&lt;/p&gt;</content>
  </entry>
  <entry>
    <title>No link</title>
    <updated>not-a-date</updated>
  </entry>
</feed>`;

describe("parseFeedXml (RSS 2.0)", () => {
  const result = parseFeedXml(RSS_FIXTURE, "feed-1", "Example News");

  it("reads channel metadata", () => {
    expect(result.source).toEqual({
      title: "Example News",
      link: "https://news.example.com",
      description: "Daily updates",
    });
    expect(result.fromCache).toBe(false);
  });

  it("normalizes a fully populated item", () => {
    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toEqual({
      guid: "guid-1",
      title: "Tom & Jerry",
      link: "https://news.example.com/tom",
      description: "Hello world",
      content: "<p>Full body</p>",
      pubDate: "2025-06-03T10:00:00.000Z",
      author: "Ada",
      categories: ["Tech", "AI"],
      media: { url: "https://cdn.example.com/a.mp3", type: "audio/mpeg" },
      feedId: "feed-1",
      feedName: "Example News",
    });
  });

  it("uses CDATA titles, a media:content fallback, and a description-based guid", () => {
    expect(result.items[1]).toMatchObject({
      guid: "feed-1-Plain text only",
      title: "Fast & Simple",
      description: "Plain text only",
      content: "Plain text only",
      link: "",
      pubDate: "",
      author: "",
      categories: [],
      media: { url: "https://cdn.example.com/pic.jpg", type: "" },
    });
  });

  it("leaves unparseable dates empty and items without media undefined", () => {
    expect(result.items[2].pubDate).toBe("");
    expect(result.items[2].media).toBeUndefined();
    expect(result.items[2].title).toBe("Bare");
  });

  it("decodes numeric and named entities in text", () => {
    const xml = "<rss><channel><title>&#x41;&#66; &lt;</title></channel></rss>";
    expect(parseFeedXml(xml, "f", "n").source.title).toBe("AB <");
  });
});

describe("parseFeedXml (Atom)", () => {
  const result = parseFeedXml(ATOM_FIXTURE, "feed-2", "Atom Blog");

  it("reads feed metadata using the first link", () => {
    expect(result.source).toEqual({
      title: "Atom Blog",
      link: "https://blog.example.org/",
      description: "Notes",
    });
  });

  it("normalizes an entry with an id, author, category, and updated date", () => {
    expect(result.items[0]).toEqual({
      guid: "tag:blog.example.org,2025:1",
      title: "First Post",
      link: "https://blog.example.org/first",
      description: "Short & sweet",
      content: "<p>Long body</p>",
      pubDate: "2025-05-02T07:30:00.000Z",
      author: "Grace",
      categories: ["Science"],
      media: undefined,
      feedId: "feed-2",
      feedName: "Atom Blog",
    });
  });

  it("falls back to a title-based guid and empty fields for a sparse entry", () => {
    expect(result.items[1]).toEqual({
      guid: "feed-2-No link",
      title: "No link",
      link: "",
      description: "",
      content: "",
      pubDate: "",
      author: "",
      categories: [],
      media: undefined,
      feedId: "feed-2",
      feedName: "Atom Blog",
    });
  });
});

describe("parseFeedXml errors", () => {
  it("rejects documents that are neither RSS nor Atom", () => {
    expect(() => parseFeedXml("<html><body>hi</body></html>", "x", "y")).toThrow("Unrecognized feed format");
  });

  it("rejects mismatched tags", () => {
    expect(() => parseFeedXml("<rss><channel><item></channel></rss>", "x", "y")).toThrow("Failed to parse feed XML");
  });

  it("rejects unclosed documents", () => {
    expect(() => parseFeedXml("<rss><channel>", "x", "y")).toThrow("Failed to parse feed XML");
  });
});

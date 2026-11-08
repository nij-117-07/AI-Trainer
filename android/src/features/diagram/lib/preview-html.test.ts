// src/features/diagram/lib/preview-html.test.ts
import { buildDrawioHtml, DRAWIO_EMBED_URL, parseBridgeMessage } from "./preview-html";

describe("buildDrawioHtml", () => {
  it("embeds the diagram XML without closing the script tag early", () => {
    const html = buildDrawioHtml('<mxGraphModel><note>x</script></note></mxGraphModel>');
    expect(html.split("</script>")).toHaveLength(2);
    expect(html).toContain("\\u003c/script>");
  });

  it("points the iframe at the diagrams.net embed", () => {
    expect(buildDrawioHtml("<mxGraphModel/>")).toContain(DRAWIO_EMBED_URL);
  });
});

describe("parseBridgeMessage", () => {
  it("reads a save message from the page", () => {
    expect(parseBridgeMessage('{"type":"save","xml":"<mxGraphModel/>"}')).toEqual({
      type: "save",
      message: undefined,
      xml: "<mxGraphModel/>",
    });
  });

  it("returns null for non-JSON or untyped messages", () => {
    expect(parseBridgeMessage("not json")).toBeNull();
    expect(parseBridgeMessage('{"xml":"x"}')).toBeNull();
  });
});

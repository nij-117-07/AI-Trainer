// src/features/charts/lib/chart-document.test.ts
import { CHART_CDN, buildChartDocument, parseChartMessage } from "./chart-document";

describe("buildChartDocument", () => {
  it("loads Chart.js from the CDN when the code does not bring its own", () => {
    const html = buildChartDocument("<div><canvas></canvas></div>");
    expect(html).toContain(`<script src="${CHART_CDN}"></script>`);
    expect(html).toContain("<div><canvas></canvas></div>");
  });

  it("does not add a second Chart.js tag when the code already loads one", () => {
    const code = '<script src="https://unpkg.com/chart.js"></script><div><canvas></canvas></div>';
    expect(buildChartDocument(code)).not.toContain(CHART_CDN);
  });
});

describe("parseChartMessage", () => {
  it("returns the error text for chart-error messages", () => {
    expect(parseChartMessage(JSON.stringify({ type: "chart-error", message: "Chart is not defined" }))).toBe(
      "Chart is not defined",
    );
  });

  it("ignores other messages and invalid JSON", () => {
    expect(parseChartMessage(JSON.stringify({ type: "ready" }))).toBeNull();
    expect(parseChartMessage("not json")).toBeNull();
  });
});

// src/theme/palettes.test.ts
import { contrastRatio, readableOn } from "./colors";
import { buildThemeColors, THEME_PRESETS } from "./palettes";

const MIN_TEXT_CONTRAST = 4.5;

describe("theme presets", () => {
  for (const preset of THEME_PRESETS) {
    for (const mode of ["light", "dark"] as const) {
      describe(`${preset.name} ${mode}`, () => {
        const colors = buildThemeColors(preset.id, mode);

        it("keeps body text readable on the background and cards", () => {
          expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
          expect(contrastRatio(colors.foreground, colors.card)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
          expect(contrastRatio(colors.mutedForeground, colors.card)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        });

        it("keeps button and hero text readable", () => {
          expect(contrastRatio(colors.primaryForeground, colors.primary)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
          expect(contrastRatio(colors.heroForeground, colors.hero)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        });
      });
    }
  }
});

describe("readableOn", () => {
  it("uses light text on dark fills and dark text on light fills", () => {
    expect(readableOn("#0B1F4D")).toBe("#FFFFFF");
    expect(readableOn("#F4F8FF")).toBe("#0B0F19");
  });
});

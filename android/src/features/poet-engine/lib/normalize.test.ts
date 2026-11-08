// src/features/poet-engine/lib/normalize.test.ts
import { normalizeConcept } from "./normalize";

describe("normalizeConcept", () => {
  it("trims every section", () => {
    expect(
      normalizeConcept({
        etymologicalSoul: "  Persian origin  ",
        originalPoetry: "\nbe yourself\n",
        soulfulTranslation: "love",
        philosophicalReflection: "reflection",
        visualMetaphor: "a lamp",
      }),
    ).toEqual({
      etymologicalSoul: "Persian origin",
      originalPoetry: "be yourself",
      soulfulTranslation: "love",
      philosophicalReflection: "reflection",
      visualMetaphor: "a lamp",
    });
  });

  it("turns missing or non-text fields into empty strings", () => {
    expect(
      normalizeConcept({ etymologicalSoul: 42, visualMetaphor: null }),
    ).toEqual({
      etymologicalSoul: "",
      originalPoetry: "",
      soulfulTranslation: "",
      philosophicalReflection: "",
      visualMetaphor: "",
    });
  });
});

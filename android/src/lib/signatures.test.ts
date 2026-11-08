// src/lib/signatures.test.ts
/** Builds every Ax signature in the app, so invalid field types fail in Jest instead of on device. */
import fs from "fs";
import path from "path";
import { ax } from "@ax-llm/ax";

const FEATURES = path.join(__dirname, "..", "features");

function signatureModules(): string[] {
  return fs
    .readdirSync(FEATURES)
    .map((feature) => path.join(FEATURES, feature, "lib", "signatures.ts"))
    .filter((file) => fs.existsSync(file));
}

describe("Ax signatures", () => {
  const modules = signatureModules();

  it("finds the signature modules", () => {
    expect(modules.length).toBeGreaterThan(10);
  });

  it.each(modules.map((file) => [path.relative(FEATURES, file), file]))("%s builds", (_name, file) => {
    const exported = require(file) as Record<string, unknown>;
    const signatures = Object.entries(exported).filter(([key]) => key.endsWith("Signature"));
    expect(signatures.length).toBeGreaterThan(0);
    for (const [, signature] of signatures) {
      expect(() => ax(signature as Parameters<typeof ax>[0])).not.toThrow();
    }
  });
});

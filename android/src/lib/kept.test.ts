import { keptCount, mergeKept } from "./kept";

type Item = { key: string; kept: boolean };
const keyOf = (item: Item) => item.key;

describe("mergeKept", () => {
  it("keeps ticked items and drops unticked ones when a new batch arrives", () => {
    const previous: Item[] = [
      { key: "a", kept: true },
      { key: "b", kept: false },
    ];
    const generated: Item[] = [
      { key: "c", kept: false },
      { key: "d", kept: true },
    ];
    expect(mergeKept(previous, generated, keyOf)).toEqual([
      { key: "a", kept: true },
      { key: "c", kept: false },
      { key: "d", kept: false },
    ]);
  });

  it("does not duplicate a kept item that is generated again", () => {
    const previous: Item[] = [{ key: "a", kept: true }];
    const generated: Item[] = [{ key: "a", kept: false }, { key: "b", kept: false }];
    expect(mergeKept(previous, generated, keyOf)).toEqual([
      { key: "a", kept: true },
      { key: "b", kept: false },
    ]);
  });
});

describe("keptCount", () => {
  it("counts ticked items", () => {
    expect(keptCount([{ key: "a", kept: true }, { key: "b", kept: false }])).toBe(1);
  });
});

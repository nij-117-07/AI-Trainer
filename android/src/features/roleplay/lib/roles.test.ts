import { ROLE_NAME_MAX, ROLE_PROMPT_MAX } from "../options";
import { findRole, normaliseRoles, removeRole, roleSlug, sortRoles, upsertRole, validateRole } from "./roles";

describe("roleSlug", () => {
  it("lower-cases the name and joins spaces with underscores", () => {
    expect(roleSlug("  Grumpy Waiter ")).toBe("grumpy_waiter");
  });
});

describe("validateRole", () => {
  it("trims both fields", () => {
    expect(validateRole({ name: " grumpy_waiter ", prompt: " You are a waiter. " })).toEqual({
      name: "grumpy_waiter",
      prompt: "You are a waiter.",
    });
  });

  it("requires a name and a prompt within the limits", () => {
    expect(() => validateRole({ name: " ", prompt: "x" })).toThrow("Name is required.");
    expect(() => validateRole({ name: "x", prompt: " " })).toThrow("Prompt is required.");
    expect(() => validateRole({ name: "x".repeat(ROLE_NAME_MAX + 1), prompt: "x" })).toThrow();
    expect(() => validateRole({ name: "x", prompt: "x".repeat(ROLE_PROMPT_MAX + 1) })).toThrow();
  });
});

describe("normaliseRoles", () => {
  it("skips damaged entries and duplicate slugs, then sorts", () => {
    const roles = normaliseRoles([
      { name: "Waiter", prompt: "A" },
      { name: "baker", prompt: "B" },
      { name: "waiter", prompt: "dup" },
      { name: "", prompt: "empty" },
      { name: "no prompt" },
      "junk",
    ]);
    expect(roles).toEqual([
      { name: "baker", prompt: "B" },
      { name: "Waiter", prompt: "A" },
    ]);
  });

  it("returns an empty list for a non-list value", () => {
    expect(normaliseRoles(null)).toEqual([]);
  });
});

describe("upsertRole", () => {
  it("adds a new role in sorted order", () => {
    const roles = upsertRole([{ name: "baker", prompt: "B" }], { name: "A-team", prompt: "A" });
    expect(roles.map((role) => role.name)).toEqual(["A-team", "baker"]);
  });

  it("updates the prompt of a role with the same slug and keeps its name", () => {
    const roles = upsertRole([{ name: "Grumpy Waiter", prompt: "old" }], { name: "grumpy waiter", prompt: "new" });
    expect(roles).toEqual([{ name: "Grumpy Waiter", prompt: "new" }]);
  });
});

describe("removeRole and findRole", () => {
  const roles = [
    { name: "Waiter", prompt: "A" },
    { name: "baker", prompt: "B" },
  ];

  it("removes the role that matches the slug", () => {
    expect(removeRole(roles, "waiter")).toEqual([{ name: "baker", prompt: "B" }]);
  });

  it("finds a role by slug", () => {
    expect(findRole(roles, "BAKER")).toEqual({ name: "baker", prompt: "B" });
    expect(findRole(roles, "pilot")).toBeUndefined();
  });
});

describe("sortRoles", () => {
  it("does not mutate the input", () => {
    const input = [
      { name: "b", prompt: "1" },
      { name: "a", prompt: "2" },
    ];
    sortRoles(input);
    expect(input[0].name).toBe("b");
  });
});

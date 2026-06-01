import { describe, expect, it } from "vitest";
import { normalizeGuardedScope } from "../state";

describe("state utils", () => {
  it("should reuse normalized scope references for reordered scope arrays", () => {
    const firstScope = normalizeGuardedScope(["profile", "billing"]);
    const secondScope = normalizeGuardedScope(["billing", "profile"]);

    expect(secondScope).toBe(firstScope);
    expect(secondScope).toEqual(["billing", "profile"]);
  });
});

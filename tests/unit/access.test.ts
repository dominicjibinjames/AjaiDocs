import { describe, expect, it } from "vitest";
import { canAccess, canDelete, canEdit, canShare } from "@/lib/access";

const ownerId = "alice";
const bob = "bob";
const carol = "carol";
const stranger = "eve";

const document = {
  ownerId,
  shares: [
    { userId: bob, role: "EDIT" },
    { userId: carol, role: "VIEW" },
  ],
};

describe("canAccess", () => {
  it("gives the owner edit access", () => {
    expect(canAccess(document, ownerId)).toBe("edit");
    expect(canEdit(canAccess(document, ownerId))).toBe(true);
  });

  it("gives an editor edit access", () => {
    expect(canAccess(document, bob)).toBe("edit");
  });

  it("gives a viewer read access", () => {
    expect(canAccess(document, carol)).toBe("view");
    expect(canEdit(canAccess(document, carol))).toBe(false);
  });

  it("denies users with no share", () => {
    expect(canAccess(document, stranger)).toBe("none");
  });
});

describe("owner-only actions", () => {
  it("only the owner can share or delete", () => {
    expect(canShare(document, ownerId)).toBe(true);
    expect(canDelete(document, ownerId)).toBe(true);
    expect(canShare(document, bob)).toBe(false);
    expect(canDelete(document, bob)).toBe(false);
    expect(canShare(document, carol)).toBe(false);
  });
});

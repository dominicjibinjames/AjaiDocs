import { describe, expect, it } from "vitest";
import { coerceDocumentJson, emptyDoc, isEffectivelyEmpty } from "@/lib/document-json";

describe("coerceDocumentJson", () => {
  it("keeps a valid doc", () => {
    const value = emptyDoc();
    expect(coerceDocumentJson(value)).toEqual({ json: value, recovered: false });
  });

  it("recovers from invalid stored JSON", () => {
    expect(coerceDocumentJson("not-json-object").recovered).toBe(true);
    expect(coerceDocumentJson({ type: "paragraph" }).recovered).toBe(true);
    expect(isEffectivelyEmpty(coerceDocumentJson(null).json)).toBe(true);
  });
});

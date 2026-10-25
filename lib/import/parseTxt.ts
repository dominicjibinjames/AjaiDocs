import { emptyDoc, type TipTapNode } from "../document-json";

export function parseTxt(text: string): TipTapNode {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalized.length) return emptyDoc();

  const lines = normalized.split("\n");
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : undefined,
    })),
  };
}

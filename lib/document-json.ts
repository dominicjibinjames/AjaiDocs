import { EMPTY_DOC } from "./constants";

export type TipTapMark = { type: "bold" | "italic" | "underline" };
export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
};

export function emptyDoc(): TipTapNode {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function isTipTapDoc(value: unknown): value is TipTapNode {
  if (!value || typeof value !== "object") return false;
  const node = value as TipTapNode;
  return node.type === "doc" && Array.isArray(node.content);
}

export function coerceDocumentJson(value: unknown): {
  json: TipTapNode;
  recovered: boolean;
} {
  if (isTipTapDoc(value)) {
    return { json: value, recovered: false };
  }
  return { json: emptyDoc(), recovered: true };
}

export function countTextChars(node: TipTapNode): number {
  if (typeof node.text === "string") return node.text.length;
  if (!node.content) return 0;
  return node.content.reduce((sum, child) => sum + countTextChars(child), 0);
}

export function isEffectivelyEmpty(node: TipTapNode): boolean {
  return countTextChars(node) === 0;
}

export { EMPTY_DOC };

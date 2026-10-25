import mammoth from "mammoth";
import { htmlToTiptap } from "./html-to-tiptap";
import type { TipTapNode } from "../document-json";

export async function parseDocx(buffer: Buffer): Promise<TipTapNode> {
  const result = await mammoth.convertToHtml({ buffer });
  return htmlToTiptap(result.value || "");
}

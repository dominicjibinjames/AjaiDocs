import { marked } from "marked";
import { htmlToTiptap } from "./html-to-tiptap";
import type { TipTapNode } from "../document-json";

marked.setOptions({ gfm: true, breaks: true });

export async function parseMd(markdown: string): Promise<TipTapNode> {
  const html = await marked.parse(markdown);
  return htmlToTiptap(typeof html === "string" ? html : String(html));
}

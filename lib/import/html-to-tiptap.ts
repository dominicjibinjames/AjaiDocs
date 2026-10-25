import { parse } from "node-html-parser";
import { emptyDoc, type TipTapMark, type TipTapNode } from "../document-json";

const SKIP = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);

function collectMarks(el: { tagName?: string; parentNode?: unknown }, inherited: TipTapMark[] = []): TipTapMark[] {
  const marks = [...inherited];
  const tag = (el.tagName || "").toLowerCase();
  const add = (type: TipTapMark["type"]) => {
    if (!marks.some((mark) => mark.type === type)) marks.push({ type });
  };
  if (tag === "strong" || tag === "b") add("bold");
  if (tag === "em" || tag === "i") add("italic");
  if (tag === "u") add("underline");
  return marks;
}

function textNode(text: string, marks: TipTapMark[]): TipTapNode | null {
  if (!text) return null;
  const node: TipTapNode = { type: "text", text };
  if (marks.length) node.marks = marks;
  return node;
}

function inlineChildren(el: { childNodes: Array<unknown> }, marks: TipTapMark[]): TipTapNode[] {
  const content: TipTapNode[] = [];
  for (const child of el.childNodes) {
    const node = child as {
      nodeType: number;
      text?: string;
      rawText?: string;
      tagName?: string;
      childNodes?: Array<unknown>;
      parentNode?: unknown;
    };
    if (node.nodeType === 3) {
      const value = (node.text ?? node.rawText ?? "").replace(/\u00a0/g, " ");
      const text = textNode(value, marks);
      if (text) content.push(text);
      continue;
    }
    if (node.nodeType !== 1 || !node.tagName) continue;
    const tag = node.tagName.toLowerCase();
    if (SKIP.has(tag)) continue;
    if (tag === "br") {
      content.push({ type: "hardBreak" });
      continue;
    }
    const nextMarks = collectMarks(node, marks);
    content.push(...inlineChildren(node as { childNodes: Array<unknown> }, nextMarks));
  }
  return content;
}

function blockFromElement(el: { tagName?: string; childNodes: Array<unknown> }): TipTapNode[] {
  const tag = (el.tagName || "").toLowerCase();
  if (SKIP.has(tag)) return [];

  if (tag === "h1" || tag === "h2") {
    const content = inlineChildren(el, []);
    return [
      {
        type: "heading",
        attrs: { level: tag === "h1" ? 1 : 2 },
        content: content.length ? content : undefined,
      },
    ];
  }

  if (tag === "ul" || tag === "ol") {
    const items = (el.childNodes as Array<{ nodeType: number; tagName?: string; childNodes: Array<unknown> }>)
      .filter((child) => child.nodeType === 1 && child.tagName?.toLowerCase() === "li")
      .map((li) => {
        const inline = inlineChildren(li, []);
        return {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: inline.length ? inline : undefined,
            },
          ],
        } satisfies TipTapNode;
      });
    if (!items.length) return [];
    return [
      {
        type: tag === "ul" ? "bulletList" : "orderedList",
        content: items,
      },
    ];
  }

  if (tag === "p" || tag === "div" || tag === "section") {
    const content = inlineChildren(el, []);
    return [{ type: "paragraph", content: content.length ? content : undefined }];
  }

  if (tag === "br") {
    return [{ type: "paragraph" }];
  }

  return inlineChildren(el, []).length
    ? [{ type: "paragraph", content: inlineChildren(el, []) }]
    : [];
}

export function htmlToTiptap(html: string): TipTapNode {
  const trimmed = html.trim();
  if (!trimmed) return emptyDoc();

  const root = parse(`<div id="root">${trimmed}</div>`, {
    blockTextElements: { script: true, style: true },
  });
  const container = root.querySelector("#root");
  if (!container) return emptyDoc();

  const blocks: TipTapNode[] = [];
  for (const child of container.childNodes) {
    const node = child as {
      nodeType: number;
      text?: string;
      rawText?: string;
      tagName?: string;
      childNodes: Array<unknown>;
    };
    if (node.nodeType === 3) {
      const text = (node.text ?? node.rawText ?? "").trim();
      if (text) {
        blocks.push({ type: "paragraph", content: [{ type: "text", text }] });
      }
      continue;
    }
    if (node.nodeType === 1) {
      blocks.push(...blockFromElement(node));
    }
  }

  const meaningful = blocks.filter((block) => {
    if (block.type === "paragraph" && !block.content?.length) return false;
    return true;
  });

  return {
    type: "doc",
    content: meaningful.length ? meaningful : [{ type: "paragraph" }],
  };
}

import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { assertImportable, ImportError, parseImportFile, titleFromFilename } from "@/lib/import";
import { parseTxt } from "@/lib/import/parseTxt";
import { parseMd } from "@/lib/import/parseMd";
import { htmlToTiptap } from "@/lib/import/html-to-tiptap";
import { countTextChars } from "@/lib/document-json";

async function makeDocx(text: string): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
  </w:body>
</w:document>`,
  );
  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}

describe("assertImportable", () => {
  it("rejects missing extensions", () => {
    expect(() => assertImportable("notes", 12)).toThrow(ImportError);
  });

  it("rejects unsupported types", () => {
    expect(() => assertImportable("virus.exe", 12)).toThrow(/not supported/);
    expect(() => assertImportable("deck.pdf", 12)).toThrow(/not supported/);
  });

  it("rejects empty and oversized files", () => {
    expect(() => assertImportable("notes.txt", 0)).toThrow(/empty/);
    expect(() => assertImportable("notes.txt", 3 * 1024 * 1024)).toThrow(/2 MB/);
  });

  it("accepts supported types under the size cap", () => {
    expect(() => assertImportable("notes.txt", 20)).not.toThrow();
    expect(() => assertImportable("notes.md", 20)).not.toThrow();
    expect(() => assertImportable("notes.docx", 20)).not.toThrow();
  });
});

describe("titleFromFilename", () => {
  it("strips extensions and path traversal", () => {
    expect(titleFromFilename("../../../etc/passwd.txt")).toBe("passwd");
    expect(titleFromFilename("C:\\\\temp\\\\Q3 notes.md")).toBe("Q3 notes");
    expect(titleFromFilename("....docx")).toBe("Untitled");
  });
});

describe("parsers", () => {
  it("keeps txt lines and CRLF", () => {
    const json = parseTxt("hello\r\nworld\n");
    expect(json.content?.map((node) => node.content?.[0]?.text ?? "")).toEqual(["hello", "world", ""]);
  });

  it("converts markdown headings and lists", async () => {
    const json = await parseMd("# Title\n\n- one\n- two\n");
    expect(json.content?.[0]).toMatchObject({ type: "heading", attrs: { level: 1 } });
    expect(json.content?.some((node) => node.type === "bulletList")).toBe(true);
  });

  it("keeps bold and italic from HTML", () => {
    const json = htmlToTiptap("<p>Hello <strong>team</strong> and <em>friends</em></p>");
    const text = json.content?.[0]?.content ?? [];
    expect(text[1]).toMatchObject({ text: "team", marks: [{ type: "bold" }] });
    expect(text[3]).toMatchObject({ text: "friends", marks: [{ type: "italic" }] });
  });

  it("parses a docx buffer", async () => {
    const buffer = await makeDocx("Hello from Word");
    const imported = await parseImportFile(buffer, "hello.docx");
    expect(imported.title).toBe("hello");
    expect(countTextChars(imported.json)).toBeGreaterThan(0);
    expect(imported.warning).toBeUndefined();
  });

  it("warns when a docx has no text", async () => {
    const buffer = await makeDocx("");
    const imported = await parseImportFile(buffer, "empty.docx");
    expect(imported.warning).toMatch(/No text content/);
  });
});

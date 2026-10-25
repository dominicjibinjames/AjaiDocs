import path from "path";
import { ALLOWED_IMPORT_EXTENSIONS, MAX_IMPORT_BYTES } from "../constants";
import { isEffectivelyEmpty, type TipTapNode } from "../document-json";
import { parseDocx } from "./parseDocx";
import { parseMd } from "./parseMd";
import { parseTxt } from "./parseTxt";
import { titleFromFilename } from "./sanitize-title";

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}

export type ImportResult = {
  title: string;
  json: TipTapNode;
  warning?: string;
};

function extensionOf(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function assertImportable(filename: string, byteLength: number) {
  const ext = extensionOf(filename);
  if (!ext) {
    throw new ImportError("This file has no extension. Upload a .txt, .md, or .docx file.");
  }
  if (!(ALLOWED_IMPORT_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new ImportError(
      `${ext} files are not supported. Upload a .txt, .md, or .docx file.`,
    );
  }
  if (byteLength === 0) {
    throw new ImportError("That file is empty. Add some text and try again.");
  }
  if (byteLength > MAX_IMPORT_BYTES) {
    throw new ImportError("That file is larger than 2 MB. Split it or export a smaller copy.");
  }
}

export async function parseImportFile(
  buffer: Buffer,
  filename: string,
): Promise<ImportResult> {
  assertImportable(filename, buffer.length);
  const ext = extensionOf(filename);
  let json: TipTapNode;

  if (ext === ".txt") {
    json = parseTxt(buffer.toString("utf8"));
  } else if (ext === ".md") {
    json = await parseMd(buffer.toString("utf8"));
  } else {
    json = await parseDocx(buffer);
  }

  const warning = isEffectivelyEmpty(json)
    ? "No text content was found in this file. You can start writing in the editor."
    : undefined;

  return {
    title: titleFromFilename(filename),
    json,
    warning,
  };
}

export { titleFromFilename };

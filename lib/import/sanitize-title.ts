export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\\/g, "/").split("/").pop() ?? "Untitled";
  const withoutExt = base.replace(/\.(txt|md|docx)$/i, "");
  const cleaned = withoutExt
    .replace(/\.\.+/g, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 200) || "Untitled";
}

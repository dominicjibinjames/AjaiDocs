export const SESSION_COOKIE = "ajaidocs_session";
export const SESSION_DAYS = 7;
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const MAX_CONTENT_CHARS = 100_000;
export const ALLOWED_IMPORT_EXTENSIONS = [".txt", ".md", ".docx"] as const;
export const DEMO_ACCOUNTS = [
  { email: "alice@ajaia.dev", name: "Alice Chen", password: "demo1234" },
  { email: "bob@ajaia.dev", name: "Bob Rivera", password: "demo1234" },
  { email: "carol@ajaia.dev", name: "Carol Nguyen", password: "demo1234" },
] as const;

export const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
} as const;

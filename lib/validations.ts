import { z } from "zod";
import { MAX_CONTENT_CHARS } from "./constants";
import { countTextChars, isTipTapDoc } from "./document-json";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const documentCreateSchema = z.object({
  title: z.string().trim().max(200).optional(),
});

export const documentPatchSchema = z
  .object({
    title: z.string().max(200).optional(),
    contentJson: z.unknown().optional(),
  })
  .refine((value) => value.title !== undefined || value.contentJson !== undefined, {
    message: "Nothing to update.",
  });

export const shareCreateSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  role: z.enum(["VIEW", "EDIT"]),
});

export const shareUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["VIEW", "EDIT"]),
});

export function normalizeTitle(title: string | undefined | null): string {
  const trimmed = title?.trim() ?? "";
  return trimmed.length ? trimmed.slice(0, 200) : "Untitled";
}

export function assertContentSize(value: unknown) {
  if (!isTipTapDoc(value)) {
    throw new Error("Document content is not valid.");
  }
  if (countTextChars(value) > MAX_CONTENT_CHARS) {
    throw new Error(
      `This document is over ${MAX_CONTENT_CHARS.toLocaleString()} characters. Shorten it to save.`,
    );
  }
}

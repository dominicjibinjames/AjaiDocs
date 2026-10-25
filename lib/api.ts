import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "./auth";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser(): Promise<
  { user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: jsonError("Sign in to continue.", 401) };
  }
  return { user };
}

export function notFound() {
  return jsonError("Document not found.", 404);
}

export function forbidden(message = "You do not have access to do that.") {
  return jsonError(message, 403);
}

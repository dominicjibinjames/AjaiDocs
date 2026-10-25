import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applySessionCookie, createSession, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Enter your email and password.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Check your email and password.", 400);
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return jsonError("Invalid email or password.", 401);
  }

  const token = await createSession(user.id);
  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
  return applySessionCookie(response, token);
}

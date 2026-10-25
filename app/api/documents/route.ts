import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { emptyDoc } from "@/lib/document-json";
import { jsonError, requireUser } from "@/lib/api";
import { documentCreateSchema, normalizeTitle } from "@/lib/validations";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: auth.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: { select: { userId: true, role: true } },
      },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: auth.user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: {
          where: { userId: auth.user.id },
          select: { userId: true, role: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    owned: owned.map((doc) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt,
      owner: doc.owner,
      role: "EDIT" as const,
    })),
    shared: shared.map((doc) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt,
      owner: doc.owner,
      role: doc.shares[0]?.role === "EDIT" ? ("EDIT" as const) : ("VIEW" as const),
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  let body: unknown = {};
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const parsed = documentCreateSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Could not create document.", 400);
  }

  const document = await prisma.document.create({
    data: {
      title: normalizeTitle(parsed.data.title),
      contentJson: emptyDoc() as Prisma.InputJsonValue,
      ownerId: auth.user.id,
    },
  });

  return NextResponse.json({
    id: document.id,
    title: document.title,
    updatedAt: document.updatedAt,
  });
}

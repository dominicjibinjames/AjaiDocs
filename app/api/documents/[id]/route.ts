import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { canAccess, canDelete, canEdit } from "@/lib/access";
import { coerceDocumentJson } from "@/lib/document-json";
import { forbidden, jsonError, notFound, requireUser } from "@/lib/api";
import { assertContentSize, documentPatchSchema, normalizeTitle } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

async function loadDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function GET(_: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const document = await loadDocument(id);
  if (!document) return notFound();

  const access = canAccess(document, auth.user.id);
  if (access === "none") return notFound();

  const { json, recovered } = coerceDocumentJson(document.contentJson);

  return NextResponse.json({
    id: document.id,
    title: document.title,
    contentJson: json,
    recovered,
    updatedAt: document.updatedAt,
    owner: document.owner,
    access,
    shares: document.shares.map((share) => ({
      userId: share.userId,
      role: share.role,
      user: share.user,
    })),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const document = await loadDocument(id);
  if (!document) return notFound();

  const access = canAccess(document, auth.user.id);
  if (access === "none") return notFound();
  if (!canEdit(access)) return forbidden("You have view-only access to this document.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Could not read that update.", 400);
  }

  const parsed = documentPatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Could not save.", 400);
  }

  const data: { title?: string; contentJson?: Prisma.InputJsonValue } = {};
  if (parsed.data.title !== undefined) {
    data.title = normalizeTitle(parsed.data.title);
  }
  if (parsed.data.contentJson !== undefined) {
    try {
      assertContentSize(parsed.data.contentJson);
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "Could not save.", 400);
    }
    data.contentJson = parsed.data.contentJson as Prisma.InputJsonValue;
  }

  const updated = await prisma.document.update({
    where: { id: document.id },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    updatedAt: updated.updatedAt,
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const document = await loadDocument(id);
  if (!document) return notFound();
  const allowed = canDelete(document, auth.user.id);
  // #region agent log
  fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
    body: JSON.stringify({
      sessionId: "ae0ad2",
      runId: "pre-fix",
      hypothesisId: "H-DEL-1",
      location: "app/api/documents/[id]/route.ts:DELETE",
      message: "delete authorization",
      data: {
        allowed,
        ownerMatch: document.ownerId === auth.user.id,
        hasShares: document.shares.length > 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!allowed) {
    return forbidden("Only the owner can delete this document.");
  }

  try {
    await prisma.document.delete({ where: { id: document.id } });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
      body: JSON.stringify({
        sessionId: "ae0ad2",
        runId: "pre-fix",
        hypothesisId: "H-DEL-2",
        location: "app/api/documents/[id]/route.ts:DELETE",
        message: "prisma delete threw",
        data: { name: error instanceof Error ? error.name : "unknown" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return jsonError("Could not delete that document.", 500);
  }
  return NextResponse.json({ ok: true });
}

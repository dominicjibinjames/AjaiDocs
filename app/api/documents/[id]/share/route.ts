import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canShare } from "@/lib/access";
import { forbidden, jsonError, notFound, requireUser } from "@/lib/api";
import { shareCreateSchema, shareUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

async function loadDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

function serialize(document: NonNullable<Awaited<ReturnType<typeof loadDocument>>>) {
  return {
    owner: document.owner,
    shares: document.shares.map((share) => ({
      userId: share.userId,
      role: share.role,
      user: share.user,
    })),
  };
}

export async function GET(_: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const document = await loadDocument(id);
  if (!document) return notFound();
  if (document.ownerId !== auth.user.id && !document.shares.some((s) => s.userId === auth.user.id)) {
    return notFound();
  }
  return NextResponse.json(serialize(document));
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const document = await loadDocument(id);
  if (!document) return notFound();
  if (!canShare(document, auth.user.id)) {
    return forbidden("Only the owner can share this document.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Enter an email and a role.", 400);
  }

  const parsed = shareCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Could not share.", 400);
  }

  const email = parsed.data.email.toLowerCase();
  if (email === document.owner.email) {
    return jsonError("This person already owns the document.", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return jsonError(
      "No account found for that email. Use a seeded demo account such as bob@ajaia.dev.",
      404,
    );
  }

  await prisma.share.upsert({
    where: { documentId_userId: { documentId: document.id, userId: user.id } },
    create: { documentId: document.id, userId: user.id, role: parsed.data.role },
    update: { role: parsed.data.role },
  });

  const next = await loadDocument(document.id);
  return NextResponse.json(serialize(next!));
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const document = await loadDocument(id);
  if (!document) return notFound();
  if (!canShare(document, auth.user.id)) {
    return forbidden("Only the owner can change access.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Could not update access.", 400);
  }

  const parsed = shareUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Could not update access.", 400);
  }

  const share = document.shares.find((entry) => entry.userId === parsed.data.userId);
  if (!share) return jsonError("That person does not have access.", 404);

  await prisma.share.update({
    where: { documentId_userId: { documentId: document.id, userId: parsed.data.userId } },
    data: { role: parsed.data.role },
  });

  const next = await loadDocument(document.id);
  return NextResponse.json(serialize(next!));
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const document = await loadDocument(id);
  if (!document) return notFound();
  if (!canShare(document, auth.user.id)) {
    return forbidden("Only the owner can remove access.");
  }

  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) return jsonError("Choose someone to remove.", 400);
  if (userId === document.ownerId) {
    return jsonError("The owner cannot be removed.", 400);
  }

  await prisma.share.deleteMany({
    where: { documentId: document.id, userId },
  });

  const next = await loadDocument(document.id);
  return NextResponse.json(serialize(next!));
}

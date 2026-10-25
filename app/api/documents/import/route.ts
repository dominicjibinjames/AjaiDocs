import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/api";
import { ImportError, parseImportFile } from "@/lib/import";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Choose a .txt, .md, or .docx file to import.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Choose a .txt, .md, or .docx file to import.", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const imported = await parseImportFile(buffer, file.name);
    const document = await prisma.document.create({
      data: {
        title: imported.title,
        contentJson: imported.json as Prisma.InputJsonValue,
        ownerId: auth.user.id,
      },
    });

    return NextResponse.json({
      id: document.id,
      title: document.title,
      warning: imported.warning,
    });
  } catch (error) {
    if (error instanceof ImportError) {
      return jsonError(error.message, 400);
    }
    console.error(error);
    return jsonError("We could not read that file.", 400);
  }
}

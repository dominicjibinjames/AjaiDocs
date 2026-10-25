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

    // #region agent log
    fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
      body: JSON.stringify({
        sessionId: "ae0ad2",
        runId: "post-fix",
        hypothesisId: "C",
        location: "app/api/documents/import/route.ts:POST",
        message: "import succeeded",
        data: { ext: file.name.split(".").pop() ?? "", hasWarning: Boolean(imported.warning) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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

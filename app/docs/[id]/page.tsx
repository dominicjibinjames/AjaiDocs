import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccess } from "@/lib/access";
import { coerceDocumentJson } from "@/lib/document-json";
import { DocumentEditorLoader } from "@/components/editor/document-editor-loader";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!document) notFound();
  const access = canAccess(document, user.id);
  if (access === "none") notFound();

  const { json, recovered } = coerceDocumentJson(document.contentJson);
  // #region agent log
  fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
    body: JSON.stringify({
      sessionId: "ae0ad2",
      runId: "post-fix",
      hypothesisId: "C",
      location: "app/docs/[id]/page.tsx:DocumentPage",
      message: "document page rendered",
      data: { hasTitle: Boolean(document.title), recovered },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <DocumentEditorLoader
      user={user}
      documentId={document.id}
      initialTitle={document.title}
      initialContent={json}
      recovered={recovered}
      initialAccess={access}
      owner={document.owner}
      initialShares={document.shares.map((share) => ({
        userId: share.userId,
        role: share.role,
        user: share.user,
      }))}
    />
  );
}

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

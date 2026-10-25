import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DocsHome } from "@/components/documents/docs-home";

export default async function DocsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: { where: { userId: user.id }, select: { role: true } },
      },
    }),
  ]);

  return (
    <DocsHome
      user={user}
      owned={owned.map((doc) => ({
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt.toISOString(),
        owner: doc.owner,
        role: "EDIT" as const,
      }))}
      shared={shared.map((doc) => ({
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt.toISOString(),
        owner: doc.owner,
        role: doc.shares[0]?.role === "EDIT" ? ("EDIT" as const) : ("VIEW" as const),
      }))}
    />
  );
}

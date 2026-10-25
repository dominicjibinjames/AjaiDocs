import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_ACCOUNTS } from "../lib/constants";

const prisma = new PrismaClient();

const welcomeDoc = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to AjaiDocs" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "A calm place for team writing. Try " },
        { type: "text", text: "bold", marks: [{ type: "bold" }] },
        { type: "text", text: ", " },
        { type: "text", text: "italic", marks: [{ type: "italic" }] },
        { type: "text", text: ", and " },
        { type: "text", text: "underline", marks: [{ type: "underline" }] },
        { type: "text", text: "." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "What to review" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Create, rename, and autosave a document" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Import a .txt, .md, or .docx file" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Share this doc with Bob as an editor" }],
            },
          ],
        },
      ],
    },
  ],
};

const productNotes = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Product notes" }],
    },
    {
      type: "orderedList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Keep the editor off the network path" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Owned vs shared should be obvious at a glance" }],
            },
          ],
        },
      ],
    },
  ],
};

const bobNotes = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Private notes. Alice should not see this unless I share it." }],
    },
  ],
};

async function main() {
  await prisma.share.deleteMany();
  await prisma.session.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_ACCOUNTS[0].password, 10);
  const users = await Promise.all(
    DEMO_ACCOUNTS.map((account) =>
      prisma.user.create({
        data: {
          email: account.email,
          name: account.name,
          passwordHash,
        },
      }),
    ),
  );

  const alice = users.find((user) => user.email === "alice@ajaia.dev")!;
  const bob = users.find((user) => user.email === "bob@ajaia.dev")!;
  const carol = users.find((user) => user.email === "carol@ajaia.dev")!;

  const welcome = await prisma.document.create({
    data: {
      title: "Welcome to AjaiDocs",
      contentJson: welcomeDoc,
      ownerId: alice.id,
    },
  });

  await prisma.document.create({
    data: {
      title: "Product notes",
      contentJson: productNotes,
      ownerId: alice.id,
    },
  });

  await prisma.document.create({
    data: {
      title: "Bob's private notes",
      contentJson: bobNotes,
      ownerId: bob.id,
    },
  });

  await prisma.share.create({
    data: {
      documentId: welcome.id,
      userId: bob.id,
      role: "EDIT",
    },
  });

  await prisma.share.create({
    data: {
      documentId: welcome.id,
      userId: carol.id,
      role: "VIEW",
    },
  });

  console.log("Seeded Alice, Bob, Carol, and sample documents.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

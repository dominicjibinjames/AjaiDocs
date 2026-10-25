const { execSync } = require("child_process");

const isVercel = Boolean(process.env.VERCEL);
const schema = isVercel ? "prisma/schema.postgres.prisma" : "prisma/schema.prisma";
const push = process.argv.includes("--push");

execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit" });

if (push && isVercel) {
  execSync(`npx prisma db push --schema=${schema}`, { stdio: "inherit" });
}

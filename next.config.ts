import type { NextConfig } from "next";
import { existsSync, readFileSync } from "fs";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "mammoth"],
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

// #region agent log
{
  const root = process.cwd();
  const server611 = existsSync(path.join(root, ".next/server/611.js"));
  const chunk611 = existsSync(path.join(root, ".next/server/chunks/611.js"));
  const chunk181 = existsSync(path.join(root, ".next/server/chunks/181.js"));
  const server181 = existsSync(path.join(root, ".next/server/181.js"));
  let buildId = "";
  try {
    buildId = readFileSync(path.join(root, ".next/BUILD_ID"), "utf8").trim();
  } catch {
    buildId = "missing";
  }
  fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
    body: JSON.stringify({
      sessionId: "ae0ad2",
      runId: "pre-fix",
      hypothesisId: "A",
      location: "next.config.ts:startup",
      message: ".next chunk layout",
      data: {
        server611,
        chunk611,
        server181,
        chunk181,
        buildId,
        nextRuntime: process.env.NEXT_RUNTIME ?? "node",
        argv: process.argv.slice(0, 6),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

export default nextConfig;

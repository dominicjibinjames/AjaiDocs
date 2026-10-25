import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "mammoth"],
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

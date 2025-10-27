import path from "node:path";
import type { NextConfig } from "next";

const appDir = __dirname;
const workspaceRoot = path.join(appDir, "..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;

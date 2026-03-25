import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pulse/design-system", "@pulse/ui"],
  outputFileTracingRoot: path.join(__dirname, "../..")
};

export default nextConfig;

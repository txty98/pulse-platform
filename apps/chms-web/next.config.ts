import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pulse/design-system", "@pulse/supabase", "@pulse/ui"]
};

export default nextConfig;

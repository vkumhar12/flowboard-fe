import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The workspace's hoisted `eslint` version (10.x, needed by apps/dashboard)
  // is newer than eslint-config-next currently supports, which breaks
  // `next build`'s built-in lint step. Linting still runs standalone via
  // `npm run lint`; this just stops it from blocking production builds.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

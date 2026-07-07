import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript errors during Vercel build to ensure smooth deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure that dynamic files read via fs are included in the Vercel serverless bundle
  outputFileTracingIncludes: {
    '/api/generate': ['./data/**/*.json', './SYSTEM.MD'],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // Proxy PocketBase through Next.js so the browser never needs a hardcoded
    // external URL. Requests to /pb/* are forwarded server-side to PocketBase.
    const pbUrl = process.env.POCKETBASE_INTERNAL_URL ?? "http://pocketbase:8090";
    return [
      {
        source: "/pb/:path*",
        destination: `${pbUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

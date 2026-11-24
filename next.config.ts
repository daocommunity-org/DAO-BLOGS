import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const privatePaths = [
      "/admin/:path*",
      "/api/admin/:path*",
      "/profile",
      "/sign-in/error",
      "/auth/callback",
    ];
    return privatePaths.map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "private, no-store" }],
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

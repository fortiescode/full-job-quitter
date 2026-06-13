import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify handles image optimization via the Next.js Runtime
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes are consistent
  trailingSlash: false,
};

export default nextConfig;

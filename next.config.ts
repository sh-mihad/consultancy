import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cover images and avatars are URLs typed by an admin, so the host set
    // cannot be enumerated ahead of time. Revisit and narrow this once image
    // uploads land and images are served from our own storage.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

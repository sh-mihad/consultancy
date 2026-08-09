import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Blog cover images now upload to Cloudinary, so that host is named
    // explicitly. The wildcard cannot go yet: the other six image fields
    // (blog/page ogImage, review avatar, hero background, about image, default
    // OG image) are still URLs typed by an admin, and their hosts cannot be
    // enumerated ahead of time. Drop it once they all use ImageUploadField —
    // a wildcard lets any host be proxied through the image optimiser.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Explicitly allow camera on same origin — required for Android Chrome
          // WebViews and some standalone PWA contexts without this header.
          { key: "Permissions-Policy", value: "camera=(self)" },
        ],
      },
    ]
  },
};

export default nextConfig;

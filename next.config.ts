import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false, // 👈 disables the bottom-left "N" icon
  },
};
export default nextConfig;

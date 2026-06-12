import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [new URL("https://auth.chalmers.it/images/user/avatar/**")],
  },
};

export default nextConfig;

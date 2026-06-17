import { env } from "@/lib/env";
import type { NextConfig } from "next";

const basePath = new URL(env.BASE_URL).pathname;

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [new URL("https://auth.chalmers.it/images/user/avatar/**")],
  },
  basePath: basePath !== "/" ? basePath : undefined,
  experimental: {
    // @ts-ignore Setting not recognized by TypeScript
    trustHostHeader: true,
  },
};

export default nextConfig;

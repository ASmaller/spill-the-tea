import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["production", "development", "test"]),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string(),
    GAMMA_CLIENT_SECRET: z.string(),
    GAMMA_CLIENT_ID: z.string(),
    GAMMA_API_KEY_ID: z.string(),
    GAMMA_API_KEY_SECRET: z.string(),
    GAMMA_REDIRECT_URI: z.url({ protocol: /^https?$/ }).optional(),
    BASE_URL: z.url({ normalize: true, protocol: /^https?$/ }),
  },
  emptyStringAsUndefined: true,
  // Infer runtime variable values from names
  experimental__runtimeEnv: {},
  // Skip validation with environment variable
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});

/**
 * Create an full URL relative to the BASE_URL.
 * @param path The URL path with or without a preceding /.
 * @returns The resulting URL starting with BASE_URL.
 */
export function relativeUrl(path: string): string {
  const baseWithPath = env.BASE_URL.replace(/\/$/, "");
  const pathWithoutSlash = path.replace(/^\//, "");
  return baseWithPath + "/" + pathWithoutSlash;
}

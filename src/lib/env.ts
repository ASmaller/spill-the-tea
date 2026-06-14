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
    BASE_URL: z.string().default("http://localhost:3000"),
  },
  // Infer runtime variable values from names
  experimental__runtimeEnv: {},
  // Skip validation with environment variable
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});

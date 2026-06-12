import "server-only";
import { randomUUID } from "crypto";
import { env } from "@/lib/env";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const CLIENT_ID_COOKIE = "client_id";

const CLIENT_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
  maxAge: CLIENT_ID_MAX_AGE_SECONDS,
});

export async function readClientId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CLIENT_ID_COOKIE)?.value;
}

export function ensureClientIdOnResponse(
  req: NextRequest,
  res: NextResponse
): string {
  const existing = req.cookies.get(CLIENT_ID_COOKIE)?.value;
  const id = existing ?? randomUUID();
  res.cookies.set(CLIENT_ID_COOKIE, id, cookieOptions());
  return id;
}

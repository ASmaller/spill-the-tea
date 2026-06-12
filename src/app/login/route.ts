import { createGammaAuthorizationCode } from "@/lib/session";
import { NextResponse } from "next/server";

export function GET() {
  const url = createGammaAuthorizationCode().authorizeUrl();
  return NextResponse.redirect(url);
}

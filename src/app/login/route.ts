import {
  createGammaAuthorizationCode,
  generateAndStoreRandomState,
} from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  let state: string;
  try {
    state = await generateAndStoreRandomState();
  } catch (error) {
    console.error(`Failed to generate and store random state: ${error}`);
    return new NextResponse(
      "500: Failed to generate randomized state, please try again later",
      { status: 500 }
    );
  }

  const url = new URL(createGammaAuthorizationCode().authorizeUrl());
  url.searchParams.append("state", state);
  return NextResponse.redirect(url);
}

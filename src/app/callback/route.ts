import { prisma } from "@/lib/prisma";
import {
  createGammaAuthorizationCode,
  createSession,
  deleteState,
  readState,
} from "@/lib/session";
import { SessionProfile } from "@/lib/types";
import { userAvatarUrl } from "gammait/urls";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code == null) {
    return new NextResponse("401 Unauthorized: Missing authorization code", {
      status: 401,
    });
  }

  const state = req.nextUrl.searchParams.get("state");
  if (state == null) {
    return new NextResponse("401 Unauthorized: Missing state", {
      status: 401,
    });
  }

  const storedState = await readState();
  if (!storedState) {
    return new NextResponse(
      "401 Unauthorized: State has expired, please try again",
      {
        status: 401,
      }
    );
  }

  if (state !== storedState) {
    return new NextResponse(
      "401 Unauthorized: Provided state does not match the stored value, please try again later",
      {
        status: 401,
      }
    );
  }

  await deleteState();

  const authorizationCode = createGammaAuthorizationCode();
  try {
    await authorizationCode.generateToken(code);
  } catch (error) {
    return new NextResponse(
      `500 Internal Server Error: Failed to generate access token, code may already be used. Details: ${String(error)}`,
      { status: 500 }
    );
  }

  const userInfo = await authorizationCode.userInfo();

  const user = await prisma.user.upsert({
    where: {
      gammaId: userInfo.sub,
    },
    create: {
      name: userInfo.nickname,
      gammaId: userInfo.sub,
    },
    update: {
      name: userInfo.nickname,
    },
  });

  const profile: SessionProfile = {
    sub: user.id,
    gamma_id: userInfo.sub,
    nickname: userInfo.nickname,
    picture: userAvatarUrl(userInfo.sub),
  };

  // Create a new session
  await createSession(profile);

  // Redirect to homepage
  // TODO: Redirect to profile page instead
  return NextResponse.redirect(new URL("/", req.url));
}

import { prisma } from "@/lib/prisma";
import {
  createGammaAuthorizationCode,
  createSession,
  isAdmin,
  SessionProfile,
} from "@/lib/session";
import { userAvatarUrl } from "gammait/urls";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code == null) {
    return new NextResponse("401 Unauthorized: Missing authorization code", {
      status: 401,
    });
  }

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

  // Redirect to the admin dashboard if an admin
  // TODO: Redirect to profile page instead
  const admin = await isAdmin();
  const destinationUrl = new URL(admin ? "/admin" : "/", req.url);
  return NextResponse.redirect(destinationUrl);
}

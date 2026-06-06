// Mostly copied from https://nextjs.org/docs/app/guides/authentication

import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import z, { ZodError } from "zod";

/** Properties stored in the session token. */
const SessionPayload = z.object({
  /** JWT subject/user id. */
  sub: z.string(),
  /** First name of the user. */
  given_name: z.string(),
  /** Last name of the user. */
  family_name: z.string(),
  /** Expiration time of the session cookie as a timestamp in seconds. */
  exp: z.number(),
});

export type SessionPayload = z.infer<typeof SessionPayload>;
// The mocked authentication does not require a secure secret since it does not
// intend to offer any actual security
const secretKey = "my-secret";
const encodedKey = new TextEncoder().encode(secretKey);

/** Time before a session expires in milliseconds. */
const sessionExpireAfter = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Encrypt a session as a JWT.
 * @param payload The JWT payload and expiration timestamp.
 * @returns The signed JWT string.
 */
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
    .sign(encodedKey);
}

/**
 * Verify and decrypt a JWT session.
 * @param session The JWT string.
 * @returns The decrypted session, or undefined if it is invalid.
 */
export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | undefined> {
  if (session == undefined) {
    return undefined;
  }
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return SessionPayload.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(`Failed to validate session. Invalid payload: ${error}`);
    } else {
      console.log("Failed to verify session");
    }
  }
}

/**
 * Create a new session for an authenticated user.
 * @param id The user id.
 * @param firstName First name of the user.
 * @param lastName Last name of the user.
 */
export async function createSession(
  id: string,
  firstName: string,
  lastName: string
) {
  // Calculate the session expiration
  const expiresAt = new Date(Date.now() + sessionExpireAfter);
  const expiresAtSeconds = expiresAt.getTime() / 1000;

  // Create a new session
  const session = await encrypt({
    sub: id,
    given_name: firstName,
    family_name: lastName,
    exp: expiresAtSeconds,
  });

  // Store the session in a cookie
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Update the current session to extend the cookie expiration time.
 * Note that the token will still expire in the same time.
 */
export async function updateSession() {
  // Get the current session
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  // Calculate the new expiration
  const expiresAt = new Date(Date.now() + sessionExpireAfter);

  // Create a new session with the new expiration time.
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Delete the current session cookie, leaving the user unauthenticated.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Verify that the session stored in the cookie is valid and redirect to
 * the login page if not.
 *
 * Protected server actions should call this function before processing
 * requests.
 *
 * @return The session if it exists and is valid.
 */
export const verifySession = cache(
  async (): Promise<SessionPayload | never> => {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    // Check if session does not exist or has expired
    const currentTimeSeconds = Date.now() / 1000;
    if (session?.exp == undefined || session.exp <= currentTimeSeconds) {
      // The mocked authentication redirects to the homepage instead of the
      // login page since the mocked login would instantly re-authenticate
      // the user.
      redirect("/");
    }

    return session;
  }
);

/**
 * Check if there is an authorized user who is an admin.
 * @return If the user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // Check if session does not exist or has expired
  const currentTimeSeconds = Date.now() / 1000;
  if (session?.exp == undefined || session.exp <= currentTimeSeconds) {
    // Session has expired
    return false;
  }

  // TODO: Check Gamma authorities
  return true;
}

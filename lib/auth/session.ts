
import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "clp_session";

const SESSION_DURATION = 60 * 60 * 8; // 8 hours

export type UserRole =
  | "ADMIN"
  | "SUB_ADMIN"
  | "CLIENT"
  | "BDE"
  | "TRAINER";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

function getSecretKey() {
  const secret = process.env.CLP_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "CLP_SESSION_SECRET is missing or too short."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionPayload) {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      !["ADMIN", "SUB_ADMIN", "CLIENT", "BDE", "TRAINER"].includes(
        payload.role as string
      )
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";

type TokenPayload = {
  sub?: string;
  exp?: number;
};

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function parseTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(decodeBase64Url(parts[1])) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = parseTokenPayload(token);
  if (!payload?.sub) return null;

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload.sub;
}

export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

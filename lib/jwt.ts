import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
const EXPIRES_IN = "7d";

export interface AdminTokenPayload extends Record<string, unknown> {
  id: string;
  email: string;
  name: string;
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRES_IN)
    .setIssuedAt()
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AdminTokenPayload;
}

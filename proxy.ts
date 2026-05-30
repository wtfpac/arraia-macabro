import { verifyAdminToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  const isLoginRoute = req.nextUrl.pathname === "/api/admin/login";
  if (isLoginRoute) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await verifyAdminToken(authHeader.slice(7));
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/admin/:path*"],
};

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAdminToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "email e password são obrigatórios" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const token = await signAdminToken({ id: admin.id, email: admin.email, name: admin.name });

  return NextResponse.json({ token });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/admin/admins — lista todos os admins
export async function GET() {
  const admins = await prisma.admin.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

// POST /api/admin/admins — cria um novo admin
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password e name são obrigatórios" },
      { status: 400 }
    );
  }

  const exists = await prisma.admin.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { error: "Email já cadastrado" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: { email, password: hashed, name },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return NextResponse.json(admin, { status: 201 });
}

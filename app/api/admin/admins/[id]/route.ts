import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// DELETE /api/admin/admins/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const count = await prisma.admin.count();
  if (count <= 1) {
    return NextResponse.json(
      { error: "Não é possível remover o último admin" },
      { status: 400 }
    );
  }

  await prisma.admin.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

// PATCH /api/admin/admins/:id — atualiza nome, email ou senha
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, email, password } = body;

  const data: Record<string, string> = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, updatedAt: true },
  });

  return NextResponse.json(admin);
}

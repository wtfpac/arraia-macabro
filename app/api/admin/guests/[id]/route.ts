import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/guests/:id — detalhe de um convidado com todos os acessos
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const guest = await prisma.guest.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      createdAt: true,
      updatedAt: true,
      response: {
        select: {
          confirmed: true,
          plusOne: true,
          plusOneName: true,
          plusOnePhone: true,
          respondedAt: true,
        },
      },
      accesses: {
        select: {
          id: true,
          ip: true,
          userAgent: true,
          fingerprint: true,
          usedAt: true,
        },
        orderBy: { usedAt: "asc" },
      },
    },
  });

  if (!guest) {
    return NextResponse.json(
      { error: "Convidado não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...guest,
    accessCount: guest.accesses.length,
  });
}

// PATCH /api/admin/guests/:id — atualiza o nome do convidado
// (código não é editável pois já pode ter sido enviado ao convidado)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name } = body as { name?: string };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "O campo 'name' é obrigatório" },
      { status: 400 }
    );
  }

  const exists = await prisma.guest.findUnique({ where: { id } });
  if (!exists) {
    return NextResponse.json(
      { error: "Convidado não encontrado" },
      { status: 404 }
    );
  }

  const guest = await prisma.guest.update({
    where: { id },
    data: { name: name.trim() },
    select: {
      id: true,
      name: true,
      code: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(guest);
}

// DELETE /api/admin/guests/:id — remove o convidado e todos os seus dados
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const exists = await prisma.guest.findUnique({ where: { id } });
  if (!exists) {
    return NextResponse.json(
      { error: "Convidado não encontrado" },
      { status: 404 }
    );
  }

  // Prisma não tem cascade automático aqui — deletamos na ordem certa
  await prisma.guestAccess.deleteMany({ where: { guestId: id } });
  await prisma.guestResponse.deleteMany({ where: { guestId: id } });
  await prisma.guest.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}

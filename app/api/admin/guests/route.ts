import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Gera um código único alfanumérico de 8 caracteres
async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists: boolean;

  do {
    code = randomBytes(4).toString("hex"); // ex: "a3f9c21b"
    exists = !!(await prisma.guest.findUnique({ where: { code } }));
  } while (exists);

  return code;
}

// GET /api/admin/guests — lista todos os convidados com contagem de acessos e resposta
export async function GET() {
  const guests = await prisma.guest.findMany({
    orderBy: { createdAt: "asc" },
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
      _count: {
        select: { accesses: true },
      },
    },
  });

  const result = guests.map((g) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    accessCount: g._count.accesses,
    response: g.response ?? null,
  }));

  return NextResponse.json(result);
}

// POST /api/admin/guests — cria um novo convidado e gera código único
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body as { name?: string };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "O campo 'name' é obrigatório" },
      { status: 400 }
    );
  }

  const code = await generateUniqueCode();

  const guest = await prisma.guest.create({
    data: { name: name.trim(), code },
    select: {
      id: true,
      name: true,
      code: true,
      createdAt: true,
    },
  });

  return NextResponse.json(guest, { status: 201 });
}

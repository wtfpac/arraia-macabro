import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/invite/validate
// Body: { code: string; fingerprint?: string }
//
// Fluxo:
//  1. Busca o Guest pelo código.
//  2. Registra o acesso (ip + userAgent + fingerprint) em GuestAccess.
//  3. No primeiro acesso nenhum IP está "dono" do link — qualquer IP passa.
//  4. Do segundo acesso em diante, valida se o IP já foi visto antes.
//     Se o IP for novo → 403.
//  5. Retorna os dados públicos do convidado + se já respondeu.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, fingerprint } = body as {
    code?: string;
    fingerprint?: string;
  };

  if (!code) {
    return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });
  }

  // ── 1. Busca o convidado ────────────────────────────────────────────────────
  const guest = await prisma.guest.findUnique({
    where: { code },
    include: {
      response: true,
      accesses: { select: { ip: true }, take: 1, orderBy: { usedAt: "asc" } },
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  // ── 2. Resolve o IP real do visitante ──────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const userAgent = req.headers.get("user-agent") ?? undefined;

  // ── 3. Verifica autorização por IP ─────────────────────────────────────────
  const firstAccess = guest.accesses[0];

  if (firstAccess && firstAccess.ip !== ip) {
    // Já existe um IP dono deste link e o atual é diferente → acesso negado.
    // Registramos mesmo assim para auditoria.
    await prisma.guestAccess.create({
      data: { guestId: guest.id, ip, userAgent, fingerprint: fingerprint ?? null },
    });

    return NextResponse.json(
      { error: "Este convite já foi acessado de outro dispositivo" },
      { status: 403 }
    );
  }

  // ── 4. Registra o acesso ───────────────────────────────────────────────────
  await prisma.guestAccess.create({
    data: { guestId: guest.id, ip, userAgent, fingerprint: fingerprint ?? null },
  });

  // ── 5. Retorna dados públicos ───────────────────────────────────────────────
  return NextResponse.json({
    guest: {
      id: guest.id,
      name: guest.name,
    },
    alreadyResponded: guest.response !== null,
    response: guest.response
      ? {
          confirmed: guest.response.confirmed,
          plusOne: guest.response.plusOne,
          plusOneName: guest.response.plusOneName,
          plusOnePhone: guest.response.plusOnePhone,
        }
      : null,
  });
}

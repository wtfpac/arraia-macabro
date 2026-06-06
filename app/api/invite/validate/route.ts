import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, fingerprint } = body as {
    code?: string;
    fingerprint?: string;
  };

  if (!code) {
    return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });
  }

  const guest = await prisma.guest.findUnique({
    where: { code },
    include: {
      response: true,
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const userAgent = req.headers.get("user-agent") ?? undefined;

  await prisma.guestAccess.create({
    data: { guestId: guest.id, ip, userAgent, fingerprint: fingerprint ?? null },
  });

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
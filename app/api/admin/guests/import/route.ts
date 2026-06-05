import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

async function generateUniqueCode(existingCodes: Set<string>): Promise<string> {
  let code: string;
  do {
    code = randomBytes(4).toString("hex");
  } while (
    existingCodes.has(code) ||
    !!(await prisma.guest.findUnique({ where: { code } }))
  );
  existingCodes.add(code);
  return code;
}

function parseNamesFromText(text: string): string[] {
  return text
    .split(/[\n\r,;]/)
    .map((n) => n.trim())
    .filter(Boolean);
}

async function extractNames(req: NextRequest): Promise<string[]> {
  const contentType = req.headers.get("content-type") ?? "";

  // multipart/form-data — arquivo .csv enviado pelo Insomnia
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (file && typeof file !== "string") {
      const text = await (file as File).text();
      return parseNamesFromText(text);
    }

    // campo de texto simples no form
    const names = formData.get("names");
    if (typeof names === "string") return parseNamesFromText(names);

    return [];
  }

  // application/json
  const body = await req.json();
  if (!body || typeof body !== "object") return [];

  if (Array.isArray((body as { names?: unknown }).names)) {
    return (body as { names: unknown[] }).names
      .map((n) => (typeof n === "string" ? n.trim() : ""))
      .filter(Boolean);
  }

  if (typeof (body as { csv?: unknown }).csv === "string") {
    return parseNamesFromText((body as { csv: string }).csv);
  }

  return [];
}

// POST /api/admin/guests/import — cria múltiplos convidados de uma vez
export async function POST(req: NextRequest) {
  const names = await extractNames(req);

  if (names.length === 0) {
    return NextResponse.json(
      {
        error:
          "Nenhum nome encontrado. Envie um arquivo CSV (campo 'file'), JSON { names: string[] } ou { csv: string }",
      },
      { status: 400 }
    );
  }

  const usedCodes = new Set<string>();
  const created = [];
  const errors: { name: string; reason: string }[] = [];

  for (const name of names) {
    try {
      const code = await generateUniqueCode(usedCodes);
      const guest = await prisma.guest.create({
        data: { name, code },
        select: { id: true, name: true, code: true, createdAt: true },
      });
      created.push(guest);
    } catch {
      errors.push({ name, reason: "Falha ao criar no banco de dados" });
    }
  }

  return NextResponse.json(
    { created: created.length, guests: created, errors },
    { status: errors.length > 0 && created.length === 0 ? 500 : 201 }
  );
}

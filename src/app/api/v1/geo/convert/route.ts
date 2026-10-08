import { NextResponse } from "next/server";
import { convert } from "@/lib/geo";

const VALID = new Set(["hood_140", "hood_158", "ward_25"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const id = searchParams.get("id") ?? "";

  if (!VALID.has(from) || !VALID.has(to) || !id) {
    return NextResponse.json(
      { error: "Use ?from=hood_140|hood_158|ward_25&to=hood_140|hood_158|ward_25&id=<code>" },
      { status: 400 }
    );
  }
  const result = convert(from, to, id);
  if (!result) return NextResponse.json({ error: `No mapping found for ${from}=${id} to ${to}` }, { status: 404 });
  return NextResponse.json(result);
}

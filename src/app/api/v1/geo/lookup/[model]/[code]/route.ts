import { NextResponse } from "next/server";
import { getData } from "@/lib/geo";

export async function GET(_req: Request, ctx: { params: Promise<{ model: string; code: string }> }) {
  const { model, code } = await ctx.params;
  if (model !== "hood_158") {
    return NextResponse.json({ error: "model must be hood_158" }, { status: 400 });
  }
  const { hood158 } = getData();
  const h = hood158.get(code.padStart(3, "0"));
  if (!h) return NextResponse.json({ error: `Unknown neighbourhood code ${code}` }, { status: 404 });
  return NextResponse.json(h);
}

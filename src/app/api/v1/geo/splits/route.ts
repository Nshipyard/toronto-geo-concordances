import { NextResponse } from "next/server";
import { getData } from "@/lib/geo";

export async function GET() {
  const { splits } = getData();
  return NextResponse.json({ count: splits.length, splits });
}

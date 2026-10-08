import { NextResponse } from "next/server";
import { getData } from "@/lib/geo";

export async function GET() {
  const { hood158 } = getData();
  return NextResponse.json({
    count: hood158.size,
    neighbourhoods: [...hood158.values()].map((h) => ({
      code: h.code,
      name: h.name,
      parent_140: h.parent140 ? { code: h.parent140.code, name: h.parent140.name } : null,
      ward_25: h.ward ? { code: h.ward.code, name: h.ward.name } : null,
      split: h.split,
    })),
  });
}

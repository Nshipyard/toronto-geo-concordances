import { NextResponse } from "next/server";
import { getData, convert } from "@/lib/geo";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "toronto-geo-concordances", version: "1.0.0" };

const TOOLS = [
  {
    name: "geo_convert",
    description:
      "Convert a Toronto geographic code between models: hood_140, hood_158, ward_25. Returns the mapped code(s) with area shares.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", enum: ["hood_140", "hood_158", "ward_25"] },
        to: { type: "string", enum: ["hood_140", "hood_158", "ward_25"] },
        id: { type: "string", description: "Code to convert, e.g. '077'" },
      },
      required: ["from", "to", "id"],
    },
  },
  {
    name: "geo_lookup",
    description:
      "Full record for one 158-model neighbourhood: name, parent in the 140 model, ward, and split siblings.",
    inputSchema: {
      type: "object",
      properties: { code: { type: "string", description: "158-model code, e.g. '166'" } },
      required: ["code"],
    },
  },
  {
    name: "geo_splits",
    description:
      "The 16 neighbourhoods split in the 2021 census re-cut: each 140 parent with its 158 children and area shares.",
    inputSchema: { type: "object", properties: {} },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: any) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "geo_convert") {
          const r = convert(String(args.from), String(args.to), String(args.id));
          if (!r) return err(id, -32001, `No mapping for ${args.from}=${args.id} to ${args.to}`);
          return ok(id, textResult(r));
        }
        if (name === "geo_lookup") {
          const { hood158 } = getData();
          const h = hood158.get(String(args.code).padStart(3, "0"));
          if (!h) return err(id, -32001, `Unknown neighbourhood code ${args.code}`);
          return ok(id, textResult(h));
        }
        if (name === "geo_splits") {
          const { splits } = getData();
          return ok(id, textResult({ count: splits.length, splits }));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}

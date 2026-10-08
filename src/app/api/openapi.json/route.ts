import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Toronto Geo Concordances API",
    version: "1.0.0",
    description:
      "Canonical crosswalk between Toronto's 140 and 158 neighbourhood models, plus ward concordances. Computed from official City of Toronto boundary geometries by exact area overlap. MIT licensed.",
  },
  servers: [{ url: "https://canada.nshipyard.com/api/v1" }],
  paths: {
    "/geo/convert": {
      get: {
        summary: "Convert a geographic code between models",
        parameters: [
          { name: "from", in: "query", required: true, schema: { type: "string", enum: ["hood_140", "hood_158", "ward_25"] } },
          { name: "to", in: "query", required: true, schema: { type: "string", enum: ["hood_140", "hood_158", "ward_25"] } },
          { name: "id", in: "query", required: true, schema: { type: "string" }, example: "077" },
        ],
        responses: { "200": { description: "Mapping result" }, "404": { description: "No mapping found" } },
      },
    },
    "/geo/lookup/hood_158/{code}": {
      get: {
        summary: "Full record for one 158 neighbourhood",
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" }, example: "166" }],
        responses: { "200": { description: "Neighbourhood record with parent, ward, and siblings" } },
      },
    },
    "/geo/splits": {
      get: {
        summary: "The 16 neighbourhoods split in the 2021 re-cut",
        responses: { "200": { description: "Parents with children and area shares" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}

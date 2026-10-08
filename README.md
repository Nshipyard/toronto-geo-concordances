# toronto-geo-concordances

The canonical crosswalk between Toronto's neighbourhood boundary models (140 → 158), plus ward concordances. Part of [Nshipyard Canada](https://canada.nshipyard.com). An open-source civic project, not affiliated with the Government of Canada or the City of Toronto.

## Why this exists

Toronto re-cut its social-planning neighbourhoods from 140 to 158 for the 2021 census round: 16 high-growth neighbourhoods were split into 34, and 124 stayed unchanged. Every longitudinal analysis that spans the 2016 and 2021 censuses hits the same wall: the city publishes both boundary vintages but no official crosswalk. Analysts hand-derive the mapping, usually wrong at the edges.

This repo publishes the mapping once, computed from the official geometries, versioned, with an explorer, a REST API, OpenAPI docs, and MCP tools.

## Data

| File | Contents |
|---|---|
| `data/hood158_to_hood140.csv` | Every 158 neighbourhood's overlap with 140-model parents: `share_of_158`, `share_of_140`, and an `is_primary` flag |
| `data/hood140_to_hood158.csv` | Reverse direction: each 140 parent with its 158 children |
| `data/ward25_to_hood158.csv` | Every 158 neighbourhood's 25-ward-model ward, verified by overlap |
| `data/neighbourhoods_158_simple.geojson` | Boundaries simplified for web maps (~134 KB) |
| `data/raw/` | Source downloads (kept for reproducibility) |

## Methodology

1. Source boundaries: City of Toronto Open Data, "Neighbourhoods" dataset (158-model GeoJSON, EPSG:4326; "Neighbourhoods - historical 140" GeoJSON) and "City Wards" dataset (25-ward model). Retrieved 2026-10-08.
2. Overlap computation: pairwise polygon intersection (Shapely 2.x) between every 158 polygon and every 140 polygon, recording intersection area as a share of each side's area.
3. Validation: all 158 neighbourhoods are covered ~100% by the 140 vintage; zero 158 neighbourhoods span multiple 140 parents above a 1% threshold. One 158 (St Lawrence-East Bayfront-The Islands, 166) has a 0.14% sliver in a second 140 polygon from vertex misalignment between vintages; it is kept in the CSV but flagged non-primary.
4. Result: 16 parents split into 34 children, 124 unchanged. Ward join: every 158 neighbourhood falls in exactly one ward.
5. The computation is deterministic; re-running on refreshed city geometries produces a new dated release.

## Versioning

Releases are dated (`v2026.10.08` style) and cut whenever the city's boundary files change. CSVs carry a header row; column additions are additive only.

## App

This repo is also a Next.js app (the explorer):

- `GET /api/v1/geo/convert?from=hood_140&to=hood_158&id=077` — convert between `hood_140`, `hood_158`, `ward_25`
- `GET /api/v1/geo/lookup/hood_158/{code}` — full neighbourhood record
- `GET /api/v1/geo/splits` — the 16 splits with area shares
- `GET /api/v1/geo/all` — all 158 records (powers the map)
- `GET /api/openapi.json` — OpenAPI 3.1 spec
- `POST /mcp` — MCP server over streamable HTTP (JSON-RPC 2.0). Tools: `geo_convert`, `geo_lookup`, `geo_splits`.

```bash
npm install
npm run dev
```

## License

MIT. Boundary geometries are © City of Toronto (open data); the concordance tables are original work.

## Author

**Richardson Dackam** — [X (@richardsondx)](https://x.com/richardsondx) · [GitHub](https://github.com/richardsondx)

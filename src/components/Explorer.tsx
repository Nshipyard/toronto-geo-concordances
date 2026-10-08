"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";

interface HoodLite {
  code: string;
  name: string;
  parent_140: { code: string; name: string } | null;
  ward_25: { code: string; name: string } | null;
  split: boolean;
}

interface HoodFull extends HoodLite {
  parent140: { code: string; name: string; share_of_158: number } | null;
  ward: { code: string; name: string } | null;
  siblings: { code: string; name: string; share_of_140: number }[];
  split: boolean;
}

interface GJFeature {
  properties: { code: string; name: string };
  geometry: { type: string; coordinates: any };
}

type ColorMode = "m158" | "m140" | "mward";

const PALETTE = [
  "#d80621", "#1d4ed8", "#047857", "#b45309", "#7c3aed", "#0e7490", "#be185d",
  "#4d7c0f", "#c2410c", "#1e3a8a", "#065f46", "#92400e", "#5b21b6", "#0c4a6e",
  "#9d174d", "#3f6212", "#9a3412", "#312e81", "#134e4a", "#78350f",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function ringPath(ring: number[][], px: (lon: number, lat: number) => [number, number]): string {
  return "M" + ring.map(([lon, lat]) => { const [x, y] = px(lon, lat); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join("L") + "Z";
}

export default function Explorer() {
  const { t } = useLang();
  const [features, setFeatures] = useState<GJFeature[]>([]);
  const [all, setAll] = useState<HoodLite[]>([]);
  const [mode, setMode] = useState<ColorMode>("m158");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<HoodFull | null>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    fetch("/geo/neighbourhoods_158_simple.geojson").then((r) => r.json()).then((d) => setFeatures(d.features));
    fetch("/api/v1/geo/all").then((r) => r.json()).then((d) => setAll(d.neighbourhoods));
  }, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    fetch(`/api/v1/geo/lookup/hood_158/${selected}`).then((r) => r.json()).then(setDetail);
  }, [selected]);

  const proj = useMemo(() => {
    if (!features.length) return null;
    const kx = Math.cos(43.7 * Math.PI / 180);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const visit = (c: number[]) => {
      const x = c[0] * kx, y = c[1];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    };
    for (const f of features) {
      const g = f.geometry;
      if (g.type === "Polygon") g.coordinates.forEach((r: number[][]) => r.forEach(visit));
      else g.coordinates.forEach((p: number[][][]) => p.forEach((r: number[][]) => r.forEach(visit)));
    }
    const W = 1000, pad = 12;
    const sx = (W - 2 * pad) / (maxX - minX);
    const H = (maxY - minY) * sx + 2 * pad;
    const px = (lon: number, lat: number): [number, number] => [
      pad + (lon * kx - minX) * sx,
      pad + (maxY - lat) * sx,
    ];
    return { px, H };
  }, [features]);

  const byCode = useMemo(() => new Map(all.map((h) => [h.code, h])), [all]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return all.filter((h) => h.name.toLowerCase().includes(q) || h.code.includes(q)).slice(0, 8);
  }, [query, all]);

  const fillFor = (code: string): string => {
    const h = byCode.get(code);
    if (!h) return "#e8e8e8";
    if (selected === code) return "#d80621";
    if (mode === "m140" && h.parent_140) return PALETTE[hashStr(h.parent_140.code) % PALETTE.length] + "55";
    if (mode === "mward" && h.ward_25) return PALETTE[hashStr(h.ward_25.code) % PALETTE.length] + "55";
    return "#e3e4e8";
  };

  const pct = (s: number) => `${(s * 100).toFixed(1)}%`;

  return (
    <section id="explorer" className="bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.explorer.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.explorer.title}</h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="overflow-hidden rounded-[24px] border border-line bg-paper">
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
              <div className="relative min-w-[240px] flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder={t.explorer.search}
                  className="w-full rounded-full border border-line bg-paper-warm px-4 py-2.5 text-[15px] outline-none focus:border-canada"
                />
                {focused && query.trim() && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-line bg-paper shadow-xl">
                    {results.length === 0 && <p className="px-4 py-3 text-[14px] text-ink/55">{t.explorer.noResult}</p>}
                    {results.map((h) => (
                      <button
                        key={h.code}
                        onMouseDown={() => { setSelected(h.code); setQuery(""); }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[15px] hover:bg-muted"
                      >
                        <span>{h.name}</span>
                        <span className="font-mono text-[13px] text-ink/50">{h.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[14px]">
                <span className="text-ink/55">{t.explorer.colorBy}:</span>
                {([["m158", t.explorer.by158], ["m140", t.explorer.by140], ["mward", t.explorer.byWard]] as [ColorMode, string][]).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-full px-3 py-1.5 font-medium ${mode === m ? "bg-ink text-white" : "border border-line text-ink/65 hover:text-ink"}`}
                    aria-pressed={mode === m}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              {!proj && <div className="flex h-[480px] items-center justify-center text-ink/40">…</div>}
              {proj && (
                <svg viewBox={`0 0 1000 ${proj.H}`} className="block w-full" role="img" aria-label="Map of Toronto neighbourhoods">
                  {features.map((f) => {
                    const code = f.properties.code;
                    const paths: string[] = [];
                    const g = f.geometry;
                    if (g.type === "Polygon") g.coordinates.forEach((r: number[][]) => paths.push(ringPath(r, proj.px)));
                    else g.coordinates.forEach((p: number[][][]) => p.forEach((r: number[][]) => paths.push(ringPath(r, proj.px))));
                    return (
                      <path
                        key={code}
                        d={paths.join(" ")}
                        fill={fillFor(code)}
                        stroke={selected === code ? "#a80419" : "#ffffff"}
                        strokeWidth={selected === code ? 3 : 1}
                        className="cursor-pointer transition-colors"
                        onClick={() => setSelected(code)}
                      >
                        <title>{f.properties.name}</title>
                      </path>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-paper p-6 md:p-8">
            {!detail && (
              <p className="text-[15px] leading-relaxed text-ink/55">
                {t.explorer.empty}
              </p>
            )}
            {detail && (
              <div>
                <p className="font-mono text-[13px] text-ink/50">{t.explorer.detail.code158} · {detail.code}</p>
                <h3 className="display mt-1 text-[30px]">{detail.name}</h3>
                <div className="mt-6 space-y-5">
                  {detail.parent140 && (
                    <div>
                      <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/50">{t.explorer.detail.parent140}</p>
                      <p className="mt-1">
                        <span className="text-[17px] font-medium">{detail.parent140.name}</span>{" "}
                        <span className="font-mono text-[14px] text-ink/50">{detail.parent140.code}</span>
                      </p>
                      <p className="text-[14px] text-ink/55">{pct(detail.parent140.share_of_158)} {t.explorer.detail.ofArea}</p>
                    </div>
                  )}
                  {detail.ward && (
                    <div>
                      <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/50">{t.explorer.detail.ward}</p>
                      <p className="mt-1 text-[17px] font-medium">{detail.ward.name} <span className="font-mono text-[14px] text-ink/50">{detail.ward.code}</span></p>
                    </div>
                  )}
                  {detail.split ? (
                    <div>
                      <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/50">{t.explorer.detail.siblings}</p>
                      <div className="mt-2 space-y-2">
                        {detail.siblings.map((s) => (
                          <button key={s.code} onClick={() => setSelected(s.code)} className="block w-full rounded-2xl border border-line px-4 py-3 text-left hover:border-canada">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="min-w-0 text-[15px] font-medium">{s.name}</span>
                              <span className="font-mono text-[13px] text-ink/50">{s.code}</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-canada" style={{ width: `${(s.share_of_140 * 100).toFixed(1)}%` }} />
                            </div>
                            <p className="mt-1 text-[13px] text-ink/55">{pct(s.share_of_140)} {t.explorer.detail.shareNote}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-muted px-4 py-3 text-[14px] text-ink/65">{t.explorer.detail.unchanged}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

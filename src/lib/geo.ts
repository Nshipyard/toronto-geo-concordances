import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export interface Pair158140 {
  hood_158: string;
  name_158: string;
  hood_140: string;
  name_140: string;
  share_of_158: number;
  share_of_140: number;
  is_primary: boolean;
}

export interface WardPair {
  hood_158: string;
  name_158: string;
  ward_25: string;
  ward_name: string;
  share_of_hood: number;
  is_primary: boolean;
}

export interface Hood158 {
  code: string;
  name: string;
  parent140: { code: string; name: string; share_of_158: number } | null;
  slivers: { code: string; name: string; share_of_158: number }[];
  ward: { code: string; name: string } | null;
  siblings: { code: string; name: string; share_of_140: number }[];
  split: boolean;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const vals: string[] = [];
    let cur = "",
      inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        vals.push(cur);
        cur = "";
      } else cur += ch;
    }
    vals.push(cur);
    const o: Record<string, string> = {};
    headers.forEach((h, i) => (o[h] = vals[i] ?? ""));
    return o;
  });
}

function load<T>(file: string, map: (r: Record<string, string>) => T): T[] {
  return parseCsv(fs.readFileSync(path.join(DATA, file), "utf8")).map(map);
}

export interface SplitChild {
  code: string;
  name: string;
  share_of_140: number;
}

export interface Split {
  hood_140: string;
  name_140: string;
  children: SplitChild[];
}

interface GeoCache {
  hood158: Map<string, Hood158>;
  splits: Split[];
}

let cache: GeoCache | null = null;

export function getData(): GeoCache {
  if (cache) return cache;

  const pairs = load<Pair158140>("hood158_to_hood140.csv", (r) => ({
    hood_158: r.hood_158,
    name_158: r.name_158,
    hood_140: r.hood_140,
    name_140: r.name_140,
    share_of_158: parseFloat(r.share_of_158),
    share_of_140: parseFloat(r.share_of_140),
    is_primary: r.is_primary === "1",
  }));

  const wards = load<WardPair>("ward25_to_hood158.csv", (r) => ({
    hood_158: r.hood_158,
    name_158: r.name_158,
    ward_25: r.ward_25,
    ward_name: r.ward_name,
    share_of_hood: parseFloat(r.share_of_hood),
    is_primary: r.is_primary === "1",
  }));

  const hood158 = new Map<string, Hood158>();
  for (const p of pairs) {
    let h = hood158.get(p.hood_158);
    if (!h) {
      h = { code: p.hood_158, name: p.name_158, parent140: null, slivers: [], ward: null, siblings: [], split: false };
      hood158.set(p.hood_158, h);
    }
    if (p.is_primary) h.parent140 = { code: p.hood_140, name: p.name_140, share_of_158: p.share_of_158 };
    else h.slivers.push({ code: p.hood_140, name: p.name_140, share_of_158: p.share_of_158 });
  }
  for (const w of wards) {
    if (w.is_primary) {
      const h = hood158.get(w.hood_158);
      if (h) h.ward = { code: w.ward_25, name: w.ward_name };
    }
  }

  // siblings: other 158s sharing the same primary 140 parent
  const byParent = new Map<string, Hood158[]>();
  for (const h of hood158.values()) {
    if (!h.parent140) continue;
    const arr = byParent.get(h.parent140.code) ?? [];
    arr.push(h);
    byParent.set(h.parent140.code, arr);
  }
  const splits: Split[] = [];
  for (const [pcode, kids] of byParent) {
    if (kids.length > 1) {
      const parentName = kids[0].parent140!.name;
      const children = kids.map((k) => {
        const pr = pairs.find((x) => x.hood_158 === k.code && x.is_primary)!;
        return { code: k.code, name: k.name, share_of_140: pr.share_of_140 };
      });
      children.sort((a, b) => b.share_of_140 - a.share_of_140);
      splits.push({ hood_140: pcode, name_140: parentName, children });
      for (const k of kids) {
        k.split = true;
        k.siblings = children.filter((c) => c.code !== k.code);
      }
    }
  }
  splits.sort((a, b) => a.hood_140.localeCompare(b.hood_140));

  cache = { hood158, splits };
  return cache;
}

export function convert(from: string, to: string, id: string) {
  const { hood158 } = getData();
  const norm = id.padStart(3, "0");
  if (from === "hood_158" && to === "hood_140") {
    const h = hood158.get(norm);
    if (!h?.parent140) return null;
    return { hood_158: h.code, hood_140: h.parent140.code, name_140: h.parent140.name, share_of_158: h.parent140.share_of_158 };
  }
  if (from === "hood_140" && to === "hood_158") {
    const kids = [...hood158.values()].filter((h) => h.parent140?.code === norm);
    if (!kids.length) return null;
    return {
      hood_140: norm,
      hood_158: kids.map((k) => ({ code: k.code, name: k.name })),
    };
  }
  if (from === "hood_158" && to === "ward_25") {
    const h = hood158.get(norm);
    if (!h?.ward) return null;
    return { hood_158: h.code, ward_25: h.ward.code, ward_name: h.ward.name };
  }
  if (from === "ward_25" && to === "hood_158") {
    const kids = [...hood158.values()].filter((h) => h.ward?.code === norm);
    if (!kids.length) return null;
    return { ward_25: norm, hood_158: kids.map((k) => ({ code: k.code, name: k.name })) };
  }
  return null;
}

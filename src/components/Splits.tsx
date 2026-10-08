"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

interface Split {
  hood_140: string;
  name_140: string;
  children: { code: string; name: string; share_of_140: number }[];
}

export default function Splits() {
  const { t } = useLang();
  const [splits, setSplits] = useState<Split[]>([]);

  useEffect(() => {
    fetch("/api/v1/geo/splits").then((r) => r.json()).then((d) => setSplits(d.splits));
  }, []);

  return (
    <section id="splits" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.splits.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.splits.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.splits.body}</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {splits.map((s) => (
            <article key={s.hood_140} className="rounded-[24px] border border-line bg-paper-warm p-6">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/50">
                {t.splits.parent} · <span className="font-mono">{s.hood_140}</span>
              </p>
              <h3 className="display mt-1 text-[24px] leading-tight">{s.name_140}</h3>
              <div className="mt-4 space-y-3 border-t border-line pt-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/50">{t.splits.children}</p>
                {s.children.map((c) => (
                  <div key={c.code}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[15px] font-medium leading-snug">{c.name}</span>
                      <span className="shrink-0 font-mono text-[13px] text-ink/50">{c.code}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/40">
                      <div className="h-full rounded-full bg-canada" style={{ width: `${(c.share_of_140 * 100).toFixed(1)}%` }} />
                    </div>
                    <p className="mt-0.5 text-[13px] text-ink/55">{(c.share_of_140 * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <a
          href="/data/hood158_to_hood140.csv"
          download
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-canada px-7 py-3.5 text-[16px] font-semibold text-white hover:bg-canada-dark"
        >
          {t.splits.download}
        </a>
      </div>
    </section>
  );
}

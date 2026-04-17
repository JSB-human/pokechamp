"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { PokemonThumb, TypeBadge } from "@/components/media";
import { toKoreanStat } from "@/lib/korean";

type LocalizedPokemon = {
  slug: string;
  nationalNumber: number;
  displayName: string;
  englishName: string;
  iconUrl: string | null;
  displayTypes: string[];
  rawTypes: string[];
  typeDetails: Array<{ name: string; slug: string; iconUrl: string | null }>;
  usage: number | null;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  moveCount: number;
};

export function PokedexBrowser({ pokemon }: { pokemon: LocalizedPokemon[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filtered = pokemon.filter((entry) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      entry.displayName.toLowerCase().includes(normalizedQuery) ||
      entry.englishName.toLowerCase().includes(normalizedQuery) ||
      entry.displayTypes.some((type) => type.toLowerCase().includes(normalizedQuery))
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">포켓몬 찾기</h2>
          <p className="mt-1 text-sm text-slate-500">
            이름, 타입, 영문명으로 빠르게 검색하고 상세 페이지에서 배울 수 있는 기술까지 이어서 확인할 수 있습니다.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 리자몽, Sneasler, 독"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <Link
            key={entry.slug}
            href={`/pokedex/${entry.slug}`}
            className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-20 items-center justify-center rounded-[1.25rem] bg-slate-100">
                  <PokemonThumb
                    slugOrName={entry.slug}
                    src={entry.iconUrl}
                    alt={entry.displayName}
                    className="size-16"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">
                    No. {entry.nationalNumber}
                  </div>
                  <h3 className="text-xl font-bold">{entry.displayName}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.rawTypes.map((type, index) => (
                      <TypeBadge
                        key={`${entry.slug}-${type}`}
                        type={type}
                        label={entry.displayTypes[index] ?? type}
                        iconUrl={entry.typeDetails[index]?.iconUrl}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                  {entry.usage != null ? `${entry.usage.toFixed(1)}%` : "-"}
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">
                  기술 {entry.moveCount}개
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Object.entries(entry.baseStats).map(([stat, value]) => (
                <div key={stat} className="rounded-2xl bg-slate-100 px-3 py-2">
                  <div className="text-[11px] tracking-[0.08em] text-slate-400">{toKoreanStat(stat)}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

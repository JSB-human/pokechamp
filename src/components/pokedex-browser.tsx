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
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">포켓몬 찾기</h2>
          <p className="mt-1 text-sm text-slate-500">
            이름, 타입, 영문명으로 빠르게 검색하고 상세 페이지에서 배울 수 있는 기술까지 이어서 확인할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
              검색 결과 {filtered.length}마리
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
              상세 페이지에서 기술 목록 확인 가능
            </span>
          </div>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 리자몽, 포푸니크, 독"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <Link
            key={entry.slug}
            href={`/pokedex/${entry.slug}`}
            className="group rounded-[1.7rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f1f7ff_100%)] p-4 shadow-[0_16px_50px_rgba(15,45,122,0.10)] transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_30px_80px_rgba(15,76,253,0.14)]"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] shadow-sm">
                  <PokemonThumb
                    slugOrName={entry.slug}
                    src={entry.iconUrl}
                    alt={entry.displayName}
                    className="size-16"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">
                    도감번호 {entry.nationalNumber}
                  </div>
                  <h3 className="truncate text-xl font-extrabold transition group-hover:text-blue-700">{entry.displayName}</h3>
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
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <span className="rounded-full bg-blue-700 px-3 py-1 text-sm font-bold text-white">
                  {entry.usage != null ? `추천 ${entry.usage.toFixed(1)}%` : "평가 준비 중"}
                </span>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  기술 {entry.moveCount}개
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(entry.baseStats).map(([stat, value]) => (
                <div key={stat} className="rounded-2xl border border-white bg-white/85 px-3 py-2 shadow-sm">
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

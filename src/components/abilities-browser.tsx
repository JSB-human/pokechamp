"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { PokemonThumb } from "@/components/media";

type LocalizedAbility = {
  slug: string;
  displayName: string;
  englishName: string;
  description: string;
  pokemon: Array<{ korean: string; english: string; iconUrl: string | null }>;
};

export function AbilitiesBrowser({ abilities }: { abilities: LocalizedAbility[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const keyword = deferredQuery.trim().toLowerCase();

  const filtered = abilities.filter((ability) => {
    if (!keyword) {
      return true;
    }

    return (
      ability.displayName.toLowerCase().includes(keyword) ||
      ability.englishName.toLowerCase().includes(keyword) ||
      ability.description.toLowerCase().includes(keyword) ||
      ability.pokemon.some(
        (entry) =>
          entry.korean.toLowerCase().includes(keyword) ||
          entry.english.toLowerCase().includes(keyword),
      )
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">특성 둘러보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            특성 설명과 함께 대표 사용자 포켓몬까지 묶어서 보여 주기 때문에 세트 감을 잡기 좋습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
              검색 결과 {filtered.length}개
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              대표 사용자 최대 4마리 표시
            </span>
          </div>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 프레셔, 선파워, 리자몽"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((ability) => (
          <Link
            key={ability.slug}
            href={`/abilities/${ability.slug}`}
            className="block rounded-[1.65rem] border border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 shadow-[0_16px_50px_rgba(16,185,129,0.10)] transition hover:-translate-y-0.5 hover:border-emerald-500"
          >
            <h3 className="text-lg font-extrabold text-slate-950">{ability.displayName}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{ability.description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ability.pokemon.slice(0, 4).map((pokemon) => (
                <div
                  key={`${ability.slug}-${pokemon.english}`}
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-white bg-white px-3 py-2 shadow-sm"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white">
                    <PokemonThumb
                      slugOrName={pokemon.english}
                      src={pokemon.iconUrl}
                      alt={pokemon.korean}
                      className="size-9"
                    />
                  </div>
                  <span className="truncate text-sm font-medium text-slate-700">{pokemon.korean}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

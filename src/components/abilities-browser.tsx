"use client";

import { useDeferredValue, useState } from "react";
import { PokemonThumb } from "@/components/media";

type LocalizedAbility = {
  slug: string;
  displayName: string;
  englishName: string;
  description: string;
  pokemon: Array<{ korean: string; english: string }>;
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
      ability.pokemon.some((entry) => entry.korean.toLowerCase().includes(keyword) || entry.english.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">특성 둘러보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            대표 사용 포켓몬 썸네일까지 함께 보여줘서 특성의 분위기를 더 직관적으로 파악할 수 있습니다.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 프레셔, Pressure, 리자몽"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((ability) => (
          <article key={ability.slug} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-bold">{ability.displayName}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{ability.description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ability.pokemon.slice(0, 4).map((pokemon) => (
                <div key={`${ability.slug}-${pokemon.english}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-white">
                    <PokemonThumb slugOrName={pokemon.english} alt={pokemon.korean} className="size-9" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{pokemon.korean}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

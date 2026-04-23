"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { TypeBadge } from "@/components/media";

type LearnableMove = {
  slug: string;
  displayName: string;
  displayType: string;
  rawType: string;
  typeIconUrl: string | null;
  displayDamageClass: string;
  rawDamageClass: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  description: string;
};

const CLASS_FILTERS = [
  { id: "all", label: "전체" },
  { id: "physical", label: "물리" },
  { id: "special", label: "특수" },
  { id: "status", label: "변화" },
] as const;

type ClassFilter = (typeof CLASS_FILTERS)[number]["id"];

export function PokemonDetailBrowser({ moves }: { moves: LearnableMove[] }) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<ClassFilter>("all");
  const deferredQuery = useDeferredValue(query);
  const keyword = deferredQuery.trim().toLowerCase();

  const availableTypes = useMemo(
    () =>
      [...new Map(moves.map((move) => [move.rawType, { type: move.rawType, label: move.displayType }])).values()],
    [moves],
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = moves.filter((move) => {
    if (classFilter !== "all" && move.rawDamageClass !== classFilter) {
      return false;
    }

    if (typeFilter !== "all" && move.rawType !== typeFilter) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    return (
      move.displayName.toLowerCase().includes(keyword) ||
      move.displayType.toLowerCase().includes(keyword) ||
      move.displayDamageClass.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">배울 수 있는 기술</h2>
          <p className="mt-1 text-sm text-slate-500">
            챔피언스 기준으로 확인된 기술만 모아 두었습니다. 분류와 타입으로 바로 거르면서 세트를 맞출 수 있습니다.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 인파이트, 독, 물리"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CLASS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setClassFilter(filter.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              classFilter === filter.id
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            typeFilter === "all"
              ? "bg-orange-500 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300"
          }`}
        >
          전체 타입
        </button>
        {availableTypes.map((entry) => (
          <button
            key={entry.type}
            type="button"
            onClick={() => setTypeFilter(entry.type)}
            className={`rounded-full border px-2 py-1 transition ${
              typeFilter === entry.type ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"
            }`}
          >
            <TypeBadge type={entry.type} label={entry.label} />
          </button>
        ))}
      </div>

      <div className="text-sm text-slate-500">검색 결과 {filtered.length}개</div>

      <div className="grid gap-3">
        {filtered.map((move) => (
          <article key={move.slug} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{move.displayName}</h3>
                  <TypeBadge
                    type={move.rawType}
                    label={move.displayType}
                    iconUrl={move.typeIconUrl}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">{move.displayDamageClass}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Tag label={`위력 ${move.power ?? "-"}`} />
                <Tag label={`명중 ${move.accuracy ?? "-"}`} />
                <Tag label={`PP ${move.pp ?? "-"}`} />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{move.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{label}</span>;
}

"use client";

import { useDeferredValue, useState } from "react";
import { TypeBadge } from "@/components/media";

type LocalizedMove = {
  slug: string;
  displayName: string;
  englishName: string;
  displayType: string;
  rawType: string;
  typeIconUrl: string | null;
  displayDamageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  description: string;
};

export function MovesBrowser({ moves }: { moves: LocalizedMove[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const keyword = deferredQuery.trim().toLowerCase();

  const filtered = moves
    .filter((move) => {
      if (!keyword) {
        return true;
      }

      return (
        move.displayName.toLowerCase().includes(keyword) ||
        move.englishName.toLowerCase().includes(keyword) ||
        move.displayType.toLowerCase().includes(keyword) ||
        move.displayDamageClass.toLowerCase().includes(keyword)
      );
    })
    .slice(0, 240);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">기술 둘러보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            이름만 찾는 도감이 아니라 타입과 분류, 위력 정보까지 바로 비교할 수 있도록 카드 중심으로 구성했습니다.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 화염방사, Flamethrower, 물리"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>
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

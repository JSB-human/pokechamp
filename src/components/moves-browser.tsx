"use client";

import Link from "next/link";
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
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">기술 둘러보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            이름만 찾는 도감이 아니라 타입과 분류, 위력 정보까지 바로 비교할 수 있도록 카드 중심으로 구성했습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">
              검색 결과 {filtered.length}개
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              위력, 명중, PP를 한눈에 비교
            </span>
          </div>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 화염방사, 드래곤클로, 물리"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>
      <div className="grid gap-3">
        {filtered.map((move) => (
          <Link
            key={move.slug}
            href={`/moves/${move.slug}`}
            className="block rounded-[1.6rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f1f7ff_100%)] p-4 shadow-[0_16px_40px_rgba(15,45,122,0.10)] transition hover:-translate-y-0.5 hover:border-blue-500"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-extrabold text-slate-950">{move.displayName}</h3>
                  <TypeBadge
                    type={move.rawType}
                    label={move.displayType}
                    iconUrl={move.typeIconUrl}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">분류: {move.displayDamageClass}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 text-sm">
                <Tag label={`위력 ${move.power ?? "-"}`} />
                <Tag label={`명중 ${move.accuracy ?? "-"}`} />
                <Tag label={`PP ${move.pp ?? "-"}`} />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{move.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return <span className="rounded-full border border-white bg-white px-3 py-1 font-medium text-slate-700 shadow-sm">{label}</span>;
}

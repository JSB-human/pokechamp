"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ItemThumb } from "@/components/media";

type LocalizedItem = {
  slug: string;
  displayName: string;
  englishName: string;
  iconUrl: string | null;
  displayCategory: string;
  description: string;
  unlockText: string;
  availableInChampions: boolean;
};

export function ItemsBrowser({ items }: { items: LocalizedItem[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const keyword = deferredQuery.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (!keyword) {
      return true;
    }

    return (
      item.displayName.toLowerCase().includes(keyword) ||
      item.englishName.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.displayCategory.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">도구 둘러보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            챔피언스에서 쓰는 실제 아이콘을 최대한 그대로 보여 주고, 분류와 획득 정보까지 바로 읽을 수 있게 정리했습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">
              검색 결과 {filtered.length}개
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              획득 정보까지 함께 표시
            </span>
          </div>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 기합의띠, 화이트허브, 메가"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Link
            key={item.slug}
            href={`/items/${item.slug}`}
            className="block rounded-[1.65rem] border border-orange-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)] p-4 shadow-[0_16px_50px_rgba(234,88,12,0.10)] transition hover:-translate-y-0.5 hover:border-orange-500"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] shadow-sm">
                  <ItemThumb slugOrName={item.slug} src={item.iconUrl} alt={item.displayName} className="size-11" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-extrabold text-slate-950">{item.displayName}</h3>
                  <p className="mt-1 text-xs text-slate-400">분류: {item.displayCategory}</p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                {item.availableInChampions ? "사용 가능" : "사용 불가"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white bg-white px-3 py-1 text-slate-700 shadow-sm">
                획득: {item.unlockText}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

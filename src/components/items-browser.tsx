"use client";

import { useDeferredValue, useState } from "react";
import { ItemThumb } from "@/components/media";

type LocalizedItem = {
  slug: string;
  displayName: string;
  englishName: string;
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">도구 둘러보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            도구 효과만 읽는 대신 아이콘까지 함께 보면서 한눈에 익힐 수 있게 바꿨습니다.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 기합의띠, White Herb, 메가"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.slug} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-[1rem] bg-orange-50">
                  <ItemThumb slugOrName={item.slug} alt={item.displayName} className="size-11" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{item.displayName}</h3>
                  <p className="mt-1 text-xs text-slate-400">{item.displayCategory}</p>
                </div>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                {item.availableInChampions ? "사용 가능" : "사용 불가"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">획득: {item.unlockText}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

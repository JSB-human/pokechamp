"use client";

import { useState } from "react";
import { TypeBadge } from "@/components/media";
import { toKoreanType } from "@/lib/korean";
import { ALL_TYPES, getTypeMultiplier } from "@/lib/type-chart";
import type { PokemonType } from "@/types/pokemon";

type TypeMeta = {
  type: PokemonType;
  iconUrl: string | null;
};

function formatMultiplier(value: number) {
  if (value === 0) {
    return "0배";
  }
  if (value === 0.25) {
    return "0.25배";
  }
  if (value === 0.5) {
    return "0.5배";
  }
  if (value === 1) {
    return "1배";
  }
  if (value === 2) {
    return "2배";
  }
  if (value === 4) {
    return "4배";
  }

  return `${value}배`;
}

function getCellClass(multiplier: number) {
  if (multiplier === 0) {
    return "bg-slate-950 text-white";
  }
  if (multiplier >= 4) {
    return "bg-rose-600 text-white";
  }
  if (multiplier > 1) {
    return "bg-rose-100 text-rose-900";
  }
  if (multiplier < 1) {
    return "bg-emerald-100 text-emerald-900";
  }

  return "bg-white text-slate-500";
}

export function TypeChartBoard({ typeMeta }: { typeMeta: TypeMeta[] }) {
  const [attackType, setAttackType] = useState<PokemonType>("Fire");
  const [defenseA, setDefenseA] = useState<PokemonType>("Grass");
  const [defenseB, setDefenseB] = useState<PokemonType | "none">("Steel");

  const iconByType = new Map(typeMeta.map((entry) => [entry.type, entry.iconUrl]));

  const defendingTypes = defenseB === "none" ? [defenseA] : [defenseA, defenseB];
  const selectedMultiplier = getTypeMultiplier(attackType, defendingTypes);

  const offenseSummary = ALL_TYPES.map((defendType) => ({
    defendType,
    multiplier: getTypeMultiplier(attackType, [defendType]),
  }));

  const defenseSummary = ALL_TYPES.map((incomingType) => ({
    incomingType,
    multiplier: getTypeMultiplier(incomingType, defendingTypes),
  }));

  return (
    <div className="space-y-6">
      <section className="grid min-w-0 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-5 shadow-[0_16px_50px_rgba(148,163,184,0.10)]">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight">공격 상성 빠르게 보기</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                공격 타입 하나를 고르면 어떤 타입에 강하고 약한지 바로 읽을 수 있습니다.
              </p>
            </div>
            <select
              value={attackType}
              onChange={(event) => setAttackType(event.target.value as PokemonType)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none md:w-auto"
            >
              {ALL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {toKoreanType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid max-w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {ALL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAttackType(type)}
                className={`flex max-w-full justify-center rounded-full border px-2 py-1 transition ${
                  attackType === type ? "border-slate-950 bg-slate-950 text-white" : "border-transparent bg-transparent"
                }`}
              >
                <TypeBadge type={type} label={toKoreanType(type)} iconUrl={iconByType.get(type)} />
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {offenseSummary.map((entry) => (
              <div
                key={`${attackType}-${entry.defendType}`}
                className={`rounded-[1.15rem] px-4 py-3 shadow-sm ${getCellClass(entry.multiplier)}`}
              >
                <div className="text-xs font-semibold tracking-[0.18em] opacity-70">대상 타입</div>
                <div className="mt-2 flex items-center gap-2">
                  <TypeBadge
                    type={entry.defendType}
                    label={toKoreanType(entry.defendType)}
                    iconUrl={iconByType.get(entry.defendType)}
                    className="bg-transparent"
                  />
                </div>
                <div className="mt-3 text-lg font-bold">{formatMultiplier(entry.multiplier)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f5fffb_100%)] p-5 shadow-[0_16px_50px_rgba(148,163,184,0.10)]">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight">방어 상성 바로 계산</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              단일 타입이나 복합 타입을 고르면 어떤 공격에 취약한지 한눈에 볼 수 있습니다.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <select
              value={defenseA}
              onChange={(event) => setDefenseA(event.target.value as PokemonType)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            >
              {ALL_TYPES.map((type) => (
                <option key={type} value={type}>
                  첫 번째 타입 · {toKoreanType(type)}
                </option>
              ))}
            </select>
            <select
              value={defenseB}
              onChange={(event) => setDefenseB(event.target.value as PokemonType | "none")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="none">두 번째 타입 없음</option>
              {ALL_TYPES.map((type) => (
                <option key={type} value={type}>
                  두 번째 타입 · {toKoreanType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 rounded-[1.3rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-500">현재 방어 조합</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TypeBadge type={defenseA} label={toKoreanType(defenseA)} iconUrl={iconByType.get(defenseA)} />
              {defenseB !== "none" ? (
                <TypeBadge type={defenseB} label={toKoreanType(defenseB)} iconUrl={iconByType.get(defenseB)} />
              ) : null}
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <span className="font-semibold">{toKoreanType(attackType)}</span> 공격을 받으면{" "}
              <span className="font-semibold text-slate-950">{formatMultiplier(selectedMultiplier)}</span>입니다.
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {defenseSummary.map((entry) => (
              <div
                key={`${entry.incomingType}-${defenseA}-${defenseB}`}
                className={`rounded-[1.1rem] px-4 py-3 shadow-sm ${getCellClass(entry.multiplier)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <TypeBadge
                    type={entry.incomingType}
                    label={toKoreanType(entry.incomingType)}
                    iconUrl={iconByType.get(entry.incomingType)}
                    className="bg-transparent"
                  />
                  <span className="text-sm font-bold">{formatMultiplier(entry.multiplier)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(148,163,184,0.10)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-2xl font-bold tracking-tight">전체 상성표</h2>
          <p className="mt-1 text-sm text-slate-500">행은 공격 타입, 열은 방어 타입입니다.</p>
        </div>
          <div className="overflow-x-auto overscroll-x-contain">
          <div className="min-w-[980px] p-4">
            <div className="grid" style={{ gridTemplateColumns: `180px repeat(${ALL_TYPES.length}, minmax(48px, 1fr))` }}>
              <div className="sticky left-0 z-10 rounded-tl-2xl bg-slate-950 px-3 py-3 text-sm font-semibold text-white">
                공격 \ 방어
              </div>
              {ALL_TYPES.map((type) => (
                <div key={`head-${type}`} className="border-b border-slate-200 bg-slate-50 px-2 py-3 text-center">
                  <div className="flex justify-center">
                    <TypeBadge type={type} label={toKoreanType(type)} iconUrl={iconByType.get(type)} />
                  </div>
                </div>
              ))}

              {ALL_TYPES.map((attackTypeEntry) => (
                <FragmentRow
                  key={attackTypeEntry}
                  attackType={attackTypeEntry}
                  iconByType={iconByType}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FragmentRow({
  attackType,
  iconByType,
}: {
  attackType: PokemonType;
  iconByType: Map<PokemonType, string | null>;
}) {
  return (
    <>
      <div className="sticky left-0 z-10 border-b border-slate-200 bg-white px-3 py-3">
        <TypeBadge type={attackType} label={toKoreanType(attackType)} iconUrl={iconByType.get(attackType)} />
      </div>
      {ALL_TYPES.map((defendType) => {
        const multiplier = getTypeMultiplier(attackType, [defendType]);
        return (
          <div
            key={`${attackType}-${defendType}`}
            className={`border-b border-l border-slate-100 px-2 py-3 text-center text-sm font-semibold ${getCellClass(multiplier)}`}
          >
            {multiplier === 1 ? "1" : multiplier}
          </div>
        );
      })}
    </>
  );
}

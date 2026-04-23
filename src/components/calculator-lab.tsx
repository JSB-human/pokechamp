"use client";

import { useMemo, useState } from "react";
import { HoverCard } from "@/components/hover-card";
import {
  calculateFinalStat,
  calculateHpStat,
  estimateBulkIndex,
  estimateDamage,
  estimatePowerIndex,
} from "@/lib/calc";
import {
  toKoreanAbilityName,
  toKoreanAbilityDescription,
  toKoreanItemDescription,
  toKoreanItemName,
  toKoreanMoveDescription,
  toKoreanMoveName,
  toKoreanNature,
  toKoreanPokemonName,
  toKoreanRole,
  toKoreanTypes,
} from "@/lib/korean";
import { smartnuoNatureBySlug } from "@/lib/smartnuo";
import type { CatalogPokemon, PokemonType } from "@/types/pokemon";

const tabs = [
  { id: "damage", label: "데미지" },
  { id: "speed", label: "스피드" },
  { id: "power", label: "결정력" },
  { id: "bulk", label: "내구" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type CalculatorLabProps = {
  catalog: CatalogPokemon[];
};

type BattleForm = {
  id: string;
  label: string;
  name: string;
  iconUrl: string | null;
  types: PokemonType[];
  baseStats: CatalogPokemon["baseStats"];
  abilityName: string | null;
  itemName: string | null;
};

export function CalculatorLab({ catalog }: CalculatorLabProps) {
  const pokemonOptions = useMemo(
    () =>
      catalog.map((pokemon) => ({
        value: pokemon.id,
        label: toKoreanPokemonName(pokemon.name, pokemon.id),
      })),
    [catalog],
  );
  const defaultAttackerId = catalog.find((pokemon) => pokemon.id === "sneasler")?.id ?? catalog[0]?.id ?? "";
  const defaultDefenderId =
    catalog.find((pokemon) => pokemon.id === "incineroar")?.id ?? catalog[1]?.id ?? defaultAttackerId;

  const [tab, setTab] = useState<TabId>("damage");
  const [attackerId, setAttackerId] = useState(defaultAttackerId);
  const [defenderId, setDefenderId] = useState(defaultDefenderId);
  const [attackerFormId, setAttackerFormId] = useState("base");
  const [defenderFormId, setDefenderFormId] = useState("base");
  const [nature, setNature] = useState("jolly");
  const [movePower, setMovePower] = useState(120);

  const attacker = catalog.find((pokemon) => pokemon.id === attackerId) ?? catalog[0];
  const defender = catalog.find((pokemon) => pokemon.id === defenderId) ?? catalog[1] ?? catalog[0];
  const activeAttacker = attacker ? resolveBattleForm(attacker, attackerFormId) : null;
  const activeDefender = defender ? resolveBattleForm(defender, defenderFormId) : null;
  const natureOptions = Object.entries(smartnuoNatureBySlug);

  const derived = useMemo(() => {
    if (!activeAttacker || !activeDefender) {
      return null;
    }

    const atk = calculateFinalStat({
      base: activeAttacker.baseStats.atk,
      natureSlug: nature,
      effort: 252,
      stat: "atk",
    });
    const spa = calculateFinalStat({
      base: activeAttacker.baseStats.spa,
      natureSlug: nature,
      effort: 252,
      stat: "spa",
    });
    const spe = calculateFinalStat({
      base: activeAttacker.baseStats.spe,
      natureSlug: nature,
      effort: 252,
      stat: "spe",
    });
    const hp = calculateHpStat({ base: activeDefender.baseStats.hp, effort: 252 });
    const def = calculateFinalStat({
      base: activeDefender.baseStats.def,
      natureSlug: "bold",
      effort: 252,
      stat: "def",
    });
    const spd = calculateFinalStat({
      base: activeDefender.baseStats.spd,
      natureSlug: "calm",
      effort: 252,
      stat: "spd",
    });

    return {
      atk,
      spa,
      spe,
      hp,
      def,
      spd,
      physicalDamage: estimateDamage({
        attack: atk,
        defense: def,
        power: movePower,
        stab: 1.5,
      }),
      specialDamage: estimateDamage({
        attack: spa,
        defense: spd,
        power: movePower,
        stab: 1.5,
      }),
      powerIndex: estimatePowerIndex({ attack: atk, power: movePower, stab: 1.5 }),
      bulkIndex: estimateBulkIndex({ hp, defense: def }),
    };
  }, [activeAttacker, activeDefender, movePower, nature]);

  if (!attacker || !defender || !activeAttacker || !activeDefender || !derived) {
    return (
      <section className="rounded-[1.8rem] border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
        계산에 사용할 포켓몬 데이터를 불러오지 못했습니다. 데이터 파일을 다시 확인해 주세요.
      </section>
    );
  }

  const featuredMoves = attacker.featuredMoves.slice(0, 4);
  const setLabel = attacker.setLabel ?? "추천 운용 예시";
  const setSummary =
    attacker.setSummary ??
    (featuredMoves.length > 0
      ? `${featuredMoves.map((move) => toKoreanMoveName(move)).join(", ")} 중심으로 빠르게 계산해 볼 수 있습니다.`
      : "아직 추천 기술이 부족한 포켓몬입니다. 기술 도감과 배울 수 있는 기술 목록을 먼저 확인해 주세요.");

  return (
    <div className="space-y-6">
      <section className="rounded-[1.9rem] border border-orange-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_42%,#eff6ff_100%)] p-5 shadow-[0_16px_50px_rgba(148,163,184,0.12)]">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-600">Damage Lab</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">쉽게 보는 실전 계산기</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              일반 포켓몬을 고른 뒤 메가진화 상태까지 바꿔 보면서 데미지와 스피드 기준을 비교합니다.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {tabs.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  tab === entry.id
                    ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:text-slate-950"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SelectCard label="공격 포켓몬" value={attackerId} onChange={setAttackerId} options={pokemonOptions} />
        <SelectCard label="방어 포켓몬" value={defenderId} onChange={setDefenderId} options={pokemonOptions} />
        <SelectCard
          label="성격"
          value={nature}
          onChange={setNature}
          options={natureOptions.map(([slug]) => ({
            value: slug,
            label: toKoreanNature(slug),
          }))}
        />
        <label className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-black text-slate-800">기술 위력</div>
          <input
            type="range"
            min={40}
            max={150}
            step={5}
            value={movePower}
            onChange={(event) => setMovePower(Number(event.target.value))}
            className="mt-4 w-full accent-orange-500"
          />
          <div className="mt-2 text-2xl font-black text-slate-950">{movePower}</div>
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <FormPicker pokemon={attacker} value={attackerFormId} onChange={setAttackerFormId} title="공격 상태" />
        <FormPicker pokemon={defender} value={defenderFormId} onChange={setDefenderFormId} title="방어 상태" />
      </section>

      {tab === "damage" ? (
        <StatGrid
          cards={[
            {
              title: "물리 데미지",
              value: `${derived.physicalDamage.min} - ${derived.physicalDamage.max}`,
              description: `${activeAttacker.label} 기준 물리 추정`,
            },
            {
              title: "특수 데미지",
              value: `${derived.specialDamage.min} - ${derived.specialDamage.max}`,
              description: `${activeAttacker.label} 기준 특수 추정`,
            },
            {
              title: "공격 실수치",
              value: `${derived.atk}`,
              description: "노력치 252 기준",
            },
            {
              title: "방어 실수치",
              value: `${derived.def}`,
              description: `${activeDefender.label} 기준`,
            },
          ]}
        />
      ) : null}

      {tab === "speed" ? (
        <StatGrid
          cards={[
            {
              title: "스피드 실수치",
              value: `${derived.spe}`,
              description: `${activeAttacker.label} / 노력치 252 기준`,
            },
            {
              title: "기본 스피드",
              value: `${activeAttacker.baseStats.spe}`,
              description: "현재 상태 종족값 기준",
            },
            {
              title: "비교 대상",
              value: `${activeDefender.baseStats.spe}`,
              description: `${activeDefender.label} 기본 스피드`,
            },
            {
              title: "판정",
              value: derived.spe > activeDefender.baseStats.spe ? "대체로 선공 가능" : "보조 수단 필요",
              description: "간단 비교 기준",
            },
          ]}
        />
      ) : null}

      {tab === "power" ? (
        <StatGrid
          cards={[
            {
              title: "결정력 지표",
              value: `${derived.powerIndex}`,
              description: "공격 실수치 x 위력 x 자속 보정",
            },
            {
              title: "물리 공격",
              value: `${derived.atk}`,
              description: `${activeAttacker.label} 기준`,
            },
            {
              title: "특수 공격",
              value: `${derived.spa}`,
              description: "특수 기술 비교용",
            },
            {
              title: "추천 해석",
              value: movePower >= 100 ? "마무리용 고화력" : "안정적인 중위력",
              description: "초보자용 빠른 가이드",
            },
          ]}
        />
      ) : null}

      {tab === "bulk" ? (
        <StatGrid
          cards={[
            {
              title: "체력 실수치",
              value: `${derived.hp}`,
              description: `${activeDefender.label} / 노력치 252 기준`,
            },
            {
              title: "물리 내구 지표",
              value: `${derived.bulkIndex}`,
              description: "HP x 방어 기준",
            },
            {
              title: "특수 방어",
              value: `${derived.spd}`,
              description: "특수 내구 비교용",
            },
            {
              title: "판정",
              value: derived.bulkIndex > 25000 ? "상대적으로 단단함" : "보호가 필요할 수 있음",
              description: "간단 계산 지표",
            },
          ]}
        />
      ) : null}

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">추천 세트</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              메가진화해도 배울 수 있는 기술은 일반 포켓몬 기술 목록을 그대로 사용합니다.
            </p>
          </div>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">
            배울 수 있는 기술 {attacker.moveCount}개
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.3rem] border border-orange-100 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-4">
            <div className="font-black text-slate-950">{setLabel}</div>
            <div className="mt-1 text-sm leading-6 text-slate-600">{setSummary}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {featuredMoves.length > 0 ? (
                featuredMoves.map((move) => {
                  const moveDetail = attacker.featuredMoveDetails.find((detail) => detail.name === move);

                  return (
                    <HoverCard
                      key={move}
                      title={toKoreanMoveName(move, moveDetail?.slug)}
                      description={
                        moveDetail
                          ? toKoreanMoveDescription(moveDetail.description, moveDetail.slug, moveDetail.name)
                          : null
                      }
                      meta={moveDetail ? `${moveDetail.type ?? "타입 미상"} / 위력 ${moveDetail.power ?? "-"}` : "추천 기술"}
                    >
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-800 shadow-sm">
                        {toKoreanMoveName(move, moveDetail?.slug)}
                      </span>
                    </HoverCard>
                  );
                })
              ) : (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                  추천 기술 준비 중
                </span>
              )}
            </div>
          </div>
          <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
            <div className="font-black text-slate-950">빠른 참고</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <InfoPill
                label="추천 도구"
                value={activeAttacker.itemName ? toKoreanItemName(activeAttacker.itemName) : "확인 필요"}
                description={
                  activeAttacker.itemName && attacker.suggestedItemDescription
                    ? toKoreanItemDescription(attacker.suggestedItemDescription, undefined, activeAttacker.itemName)
                    : null
                }
              />
              <InfoPill
                label="현재 특성"
                value={activeAttacker.abilityName ? toKoreanAbilityName(activeAttacker.abilityName) : "확인 필요"}
                description={
                  activeAttacker.abilityName && attacker.suggestedAbilityDescription
                    ? toKoreanAbilityDescription(attacker.suggestedAbilityDescription, undefined, activeAttacker.abilityName)
                    : null
                }
              />
              <InfoPill label="타입" value={toKoreanTypes(activeAttacker.types).join(" / ")} />
              <InfoPill label="역할" value={attacker.roles.slice(0, 2).map(toKoreanRole).join(" / ") || "확인 필요"} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function resolveBattleForm(pokemon: CatalogPokemon, formId: string): BattleForm {
  const mega = pokemon.megaVariants.find((variant) => variant.id === formId);

  if (!mega) {
    return {
      id: "base",
      label: toKoreanPokemonName(pokemon.name, pokemon.id),
      name: pokemon.name,
      iconUrl: pokemon.iconUrl,
      types: pokemon.types,
      baseStats: pokemon.baseStats,
      abilityName: pokemon.suggestedAbility,
      itemName: pokemon.suggestedItem,
    };
  }

  return {
    id: mega.id,
    label: toKoreanPokemonName(mega.name, mega.id),
    name: mega.name,
    iconUrl: mega.iconUrl,
    types: mega.types,
    baseStats: mega.baseStats,
    abilityName: mega.abilityName,
    itemName: mega.megaStoneName,
  };
}

function FormPicker({
  pokemon,
  value,
  onChange,
  title,
}: {
  pokemon: CatalogPokemon;
  value: string;
  onChange: (value: string) => void;
  title: string;
}) {
  const options = [
    { value: "base", label: "일반 상태" },
    ...pokemon.megaVariants.map((mega) => ({
      value: mega.id,
      label: toKoreanPokemonName(mega.name, mega.id),
    })),
  ];
  const active = resolveBattleForm(pokemon, value);

  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-slate-800">{title}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">{active.label}</div>
        </div>
        {pokemon.megaVariants.length > 0 ? (
          <select
            value={options.some((option) => option.value === value) ? value : "base"}
            onChange={(event) => onChange(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">메가진화 없음</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <InfoPill label="공격" value={`${active.baseStats.atk}`} />
        <InfoPill label="특공" value={`${active.baseStats.spa}`} />
        <InfoPill label="스피드" value={`${active.baseStats.spe}`} />
      </div>
    </div>
  );
}

function SelectCard({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="min-w-0 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm">
      <div className="text-sm font-black text-slate-800">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoPill({ label, value, description }: { label: string; value: string; description?: string | null }) {
  const content = (
    <div className="rounded-2xl bg-white p-3">
      <div className="text-xs font-black text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-slate-950">{value}</div>
    </div>
  );

  return description ? (
    <HoverCard title={value} description={description} meta={label} className="block">
      {content}
    </HoverCard>
  ) : (
    content
  );
}

function StatGrid({
  cards,
}: {
  cards: Array<{ title: string; value: string; description: string }>;
}) {
  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-5 shadow-[0_16px_40px_rgba(148,163,184,0.10)]"
        >
          <div className="text-sm font-black text-slate-700">{card.title}</div>
          <div className="mt-3 text-2xl font-black text-slate-950">{card.value}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
        </div>
      ))}
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { pokemonData } from "@/data/champions-data";
import { calculateFinalStat, calculateHpStat, estimateBulkIndex, estimateDamage, estimatePowerIndex } from "@/lib/calc";
import { toKoreanMoveName, toKoreanNature, toKoreanPokemonName } from "@/lib/korean";
import { smartnuoNatureBySlug } from "@/lib/smartnuo";

const tabs = [
  { id: "damage", label: "데미지" },
  { id: "speed", label: "스피드" },
  { id: "power", label: "결정력" },
  { id: "bulk", label: "내구력" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function CalculatorLab() {
  const [tab, setTab] = useState<TabId>("damage");
  const [attackerName, setAttackerName] = useState("Sneasler");
  const [defenderName, setDefenderName] = useState("Incineroar");
  const [nature, setNature] = useState("jolly");
  const [movePower, setMovePower] = useState(120);

  const attacker = pokemonData.find((pokemon) => pokemon.name === attackerName) ?? pokemonData[0];
  const defender = pokemonData.find((pokemon) => pokemon.name === defenderName) ?? pokemonData[1];

  const derived = useMemo(() => {
    const atk = calculateFinalStat({
      base: attacker.baseStats.atk,
      natureSlug: nature,
      effort: 252,
      stat: "atk",
    });
    const spa = calculateFinalStat({
      base: attacker.baseStats.spa,
      natureSlug: nature,
      effort: 252,
      stat: "spa",
    });
    const spe = calculateFinalStat({
      base: attacker.baseStats.spe,
      natureSlug: nature,
      effort: 252,
      stat: "spe",
    });
    const hp = calculateHpStat({ base: defender.baseStats.hp, effort: 252 });
    const def = calculateFinalStat({
      base: defender.baseStats.def,
      natureSlug: "bold",
      effort: 252,
      stat: "def",
    });
    const spd = calculateFinalStat({
      base: defender.baseStats.spd,
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
  }, [
    attacker.baseStats.atk,
    attacker.baseStats.spa,
    attacker.baseStats.spe,
    defender.baseStats.def,
    defender.baseStats.hp,
    defender.baseStats.spd,
    movePower,
    nature,
  ]);

  const natureOptions = Object.entries(smartnuoNatureBySlug);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === entry.id
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-slate-950"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        <SelectCard
          label="공격 포켓몬"
          value={attackerName}
          onChange={setAttackerName}
          options={pokemonData.map((pokemon) => ({
            value: pokemon.name,
            label: toKoreanPokemonName(pokemon.name, pokemon.id),
          }))}
        />
        <SelectCard
          label="방어 포켓몬"
          value={defenderName}
          onChange={setDefenderName}
          options={pokemonData.map((pokemon) => ({
            value: pokemon.name,
            label: toKoreanPokemonName(pokemon.name, pokemon.id),
          }))}
        />
        <SelectCard
          label="성격"
          value={nature}
          onChange={setNature}
          options={natureOptions.map(([slug, name]) => ({
            value: slug,
            label: toKoreanNature(slug) || name,
          }))}
        />
        <label className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">기술 위력</div>
          <input
            type="range"
            min={40}
            max={150}
            step={5}
            value={movePower}
            onChange={(event) => setMovePower(Number(event.target.value))}
            className="mt-4 w-full"
          />
          <div className="mt-2 text-2xl font-bold">{movePower}</div>
        </label>
      </section>

      {tab === "damage" ? (
        <StatGrid
          cards={[
            {
              title: "물리 데미지",
              value: `${derived.physicalDamage.min} - ${derived.physicalDamage.max}`,
              description: `${toKoreanPokemonName(attacker.name, attacker.id)} 기준 물리 추정`,
            },
            {
              title: "특수 데미지",
              value: `${derived.specialDamage.min} - ${derived.specialDamage.max}`,
              description: `${toKoreanPokemonName(attacker.name, attacker.id)} 기준 특수 추정`,
            },
            {
              title: "공격 실수치",
              value: `${derived.atk}`,
              description: "252 노력치 기준",
            },
            {
              title: "방어 실수치",
              value: `${derived.def}`,
              description: `${toKoreanPokemonName(defender.name, defender.id)} 기준`,
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
              description: `${toKoreanPokemonName(attacker.name, attacker.id)} / 252 노력치`,
            },
            {
              title: "기본 스피드",
              value: `${attacker.baseStats.spe}`,
              description: "도감 기준 종족값",
            },
            {
              title: "비교 대상",
              value: `${defender.baseStats.spe}`,
              description: `${toKoreanPokemonName(defender.name, defender.id)} 기본 스피드`,
            },
            {
              title: "한 줄 해석",
              value: derived.spe > defender.baseStats.spe ? "대체로 선공 가능" : "보조 수단 필요",
              description: "간단 비교 기준",
            },
          ]}
        />
      ) : null}

      {tab === "power" ? (
        <StatGrid
          cards={[
            {
              title: "결정력 지수",
              value: `${derived.powerIndex}`,
              description: "공격 실수치 x 위력 x 자속 보정",
            },
            {
              title: "물리 공격 실수치",
              value: `${derived.atk}`,
              description: `${toKoreanPokemonName(attacker.name, attacker.id)} 기준`,
            },
            {
              title: "특수 공격 실수치",
              value: `${derived.spa}`,
              description: "특수 기술 비교용",
            },
            {
              title: "추천 해석",
              value: movePower >= 100 ? "마무리용 강타" : "안정적인 중위력",
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
              description: `${toKoreanPokemonName(defender.name, defender.id)} / 252 노력치`,
            },
            {
              title: "물리 내구 지수",
              value: `${derived.bulkIndex}`,
              description: "HP x 방어 기준",
            },
            {
              title: "특수 방어 실수치",
              value: `${derived.spd}`,
              description: "특수 내구 비교용",
            },
            {
              title: "한 줄 해석",
              value: derived.bulkIndex > 25000 ? "튼튼한 축" : "보호가 필요한 축",
              description: "단순 참고 지표",
            },
          ]}
        />
      ) : null}

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">참고용 세트</h2>
        <p className="mt-1 text-sm text-slate-500">
          계산기는 현재 MVP 단계라 실제 전투 완전 재현이 아니라 빠른 감 잡기용입니다.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {attacker.sets.map((set) => (
            <div key={set.label} className="rounded-[1.3rem] bg-slate-50 p-4">
              <div className="font-semibold">{set.label}</div>
              <div className="mt-1 text-sm text-slate-500">{set.summary}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {set.moves.map((move) => (
                  <span key={move} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {toKoreanMoveName(move)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
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
    <label className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
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

function StatGrid({
  cards,
}: {
  cards: Array<{ title: string; value: string; description: string }>;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">{card.title}</div>
          <div className="mt-3 text-2xl font-bold">{card.value}</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
        </div>
      ))}
    </section>
  );
}

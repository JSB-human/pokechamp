"use client";

import { startTransition, useState } from "react";
import { PokemonThumb, TypeBadge } from "@/components/media";
import { pokemonData } from "@/data/champions-data";
import { toKoreanPokemonName, toKoreanRole, toKoreanTypes } from "@/lib/korean";
import { analyzeParty } from "@/lib/recommendations";

const slots = 6;

export function BuilderBoard() {
  const [party, setParty] = useState<Array<string | null>>([
    "Sneasler",
    "Incineroar",
    "Pelipper",
    null,
    null,
    null,
  ]);
  const analysis = analyzeParty(party.filter((entry): entry is string => Boolean(entry)));

  function addPokemon(name: string) {
    startTransition(() => {
      setParty((current) => {
        if (current.includes(name)) {
          return current;
        }

        const next = [...current];
        const index = next.findIndex((entry) => entry === null);
        next[index === -1 ? next.length - 1 : index] = name;
        return next;
      });
    });
  }

  function removePokemon(index: number) {
    startTransition(() => {
      setParty((current) => current.map((entry, currentIndex) => (currentIndex === index ? null : entry)));
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold">내 파티</h2>
          <p className="mt-1 text-sm text-slate-500">6칸을 채우면 약점, 역할, 추천 포켓몬을 함께 볼 수 있습니다.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: slots }, (_, index) => {
              const member = party[index];
              const pokemon = member ? pokemonData.find((entry) => entry.name === member) : null;

              return (
                <div key={index} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">슬롯 {index + 1}</div>
                  {pokemon ? (
                    <>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex size-16 items-center justify-center rounded-[1rem] bg-white">
                          <PokemonThumb slugOrName={pokemon.id} alt={toKoreanPokemonName(pokemon.name, pokemon.id)} className="size-12" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{toKoreanPokemonName(pokemon.name, pokemon.id)}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pokemon.types.map((type, typeIndex) => (
                              <TypeBadge
                                key={`${pokemon.id}-${type}`}
                                type={type}
                                label={toKoreanTypes(pokemon.types)[typeIndex]}
                                className="h-6 w-auto"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePokemon(index)}
                        className="mt-4 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        빼기
                      </button>
                    </>
                  ) : (
                    <div className="mt-3 text-sm text-slate-500">아래 목록에서 눌러 추가하세요.</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold">파티 요약</h2>
          <div className="mt-4 space-y-4">
            <SummaryBlock
              title="채워진 역할"
              values={analysis.roleCoverage.map((role) => toKoreanRole(role))}
              emptyText="아직 역할 분석 데이터가 부족합니다."
            />
            <SummaryBlock
              title="겹치는 약점"
              values={analysis.sharedWeaknesses.map((entry) => `${toKoreanTypes([entry.type])[0]} ${entry.count}`)}
              emptyText="눈에 띄는 겹치는 약점은 없습니다."
            />
            <SummaryBlock
              title="중복 도구"
              values={analysis.duplicateItems.map((entry) => `${entry.item} ${entry.count}`)}
              emptyText="중복된 기본 아이템은 없습니다."
            />
          </div>
        </section>
      </div>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">추천 포켓몬</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {analysis.suggestions.map((entry) => (
            <button
              key={entry.pokemon.id}
              type="button"
              onClick={() => addPokemon(entry.pokemon.name)}
              className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-[1rem] bg-white">
                    <PokemonThumb slugOrName={entry.pokemon.id} alt={toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)} className="size-10" />
                  </div>
                  <div>
                    <div className="font-semibold">{toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.pokemon.types.map((type, index) => (
                        <TypeBadge
                          key={`${entry.pokemon.id}-${type}`}
                          type={type}
                          label={toKoreanTypes(entry.pokemon.types)[index]}
                          className="h-6 w-auto"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  +{entry.score}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{entry.reasons[0]}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">빠른 추가</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pokemonData.map((pokemon) => (
            <button
              key={pokemon.id}
              type="button"
              onClick={() => addPokemon(pokemon.name)}
              className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-300 hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-[1rem] bg-white">
                  <PokemonThumb slugOrName={pokemon.id} alt={toKoreanPokemonName(pokemon.name, pokemon.id)} className="size-10" />
                </div>
                <div>
                  <div className="font-semibold">{toKoreanPokemonName(pokemon.name, pokemon.id)}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pokemon.types.map((type, index) => (
                      <TypeBadge
                        key={`${pokemon.id}-${type}`}
                        type={type}
                        label={toKoreanTypes(pokemon.types)[index]}
                        className="h-6 w-auto"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryBlock({
  title,
  values,
  emptyText,
}: {
  title: string;
  values: string[];
  emptyText: string;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.length > 0 ? (
          values.map((value) => (
            <span key={value} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {value}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">{emptyText}</span>
        )}
      </div>
    </div>
  );
}

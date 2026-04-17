"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { ItemThumb, PokemonThumb, TypeBadge } from "@/components/media";
import { pokemonData, sourceSummary, teamPresets } from "@/data/champions-data";
import { analyzeParty } from "@/lib/recommendations";
import {
  toKoreanAbilityName,
  toKoreanItemName,
  toKoreanMoveName,
  toKoreanPokemonName,
  toKoreanRole,
  toKoreanTypes,
} from "@/lib/korean";
import type { CollectedOverview, NamuOverview } from "@/types/collected-data";

const TEAM_SIZE = 6;

function createEmptyParty() {
  return Array.from({ length: TEAM_SIZE }, () => null) as Array<string | null>;
}

export function HomeDashboard({
  overview,
  namuOverview,
}: {
  overview: CollectedOverview;
  namuOverview: NamuOverview;
}) {
  const [party, setParty] = useState<Array<string | null>>([
    "Sneasler",
    "Incineroar",
    "Pelipper",
    null,
    null,
    null,
  ]);
  const [selectedName, setSelectedName] = useState("Sneasler");

  const analysis = analyzeParty(party.filter((item): item is string => Boolean(item)));
  const selectedPokemon = pokemonData.find((entry) => entry.name === selectedName) ?? pokemonData[0];

  function assignToFirstEmpty(name: string) {
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

  function applyPreset(id: string) {
    const preset = teamPresets.find((entry) => entry.id === id);
    if (!preset) {
      return;
    }

    startTransition(() => {
      const next = createEmptyParty();
      preset.members.forEach((member, index) => {
        next[index] = member;
      });
      setParty(next);
      setSelectedName(preset.members[0] ?? "Sneasler");
    });
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-slate-950 text-white shadow-[0_30px_120px_rgba(15,23,42,0.24)]">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.25fr_0.95fr] lg:px-8 lg:py-10">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
              쉬운 한국어 포켓몬 챔피언스
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                텍스트만 읽지 않아도 감이 오는 포켓몬 챔피언스 데이터
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                포켓몬 썸네일, 도구 아이콘, 타입 배지를 같이 보여줘서 처음 보는 분도 더 직관적으로
                이해할 수 있게 바꿨습니다. 샘플 파티와 계산기까지 한글 흐름으로 이어집니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <QuickLink href="/pokedex" label="포켓몬 도감" />
              <QuickLink href="/samples" label="샘플 파티" />
              <QuickLink href="/builder" label="파티 빌더" />
              <QuickLink href="/calculator" label="계산기" />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <div className="text-sm font-semibold text-white">데이터 참고</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {sourceSummary.siteName}, OP.GG, 나무위키 문서를 바탕으로 정리했습니다. 문서 구조는{" "}
                {namuOverview.headings.slice(0, 4).join(", ")} 흐름을 참고했습니다.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <HeroStat label="포켓몬 수" value={`${overview.pokemonCount ?? "-"}`} detail="도감과 파티 빌더에서 바로 탐색" />
            <HeroStat label="기술 수" value={`${overview.moveCount ?? "-"}`} detail="기술 한글명과 타입 배지 연결" />
            <HeroStat label="특성 수" value={`${overview.abilityCount ?? "-"}`} detail="대표 사용자 포켓몬까지 함께 표시" />
            <HeroStat label="핵심 도구" value="아이콘 연동" detail="아이템 카드에서 바로 시각적으로 확인" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FeatureCard title="도감" description="포켓몬, 기술, 도구, 특성을 이미지와 함께 훑어볼 수 있습니다." href="/pokedex" />
        <FeatureCard title="샘플" description="대표 메타 조합을 포켓몬 썸네일과 함께 직관적으로 보여줍니다." href="/samples" />
        <FeatureCard title="계산기" description="데미지, 스피드, 결정력, 내구력을 탭으로 나눠 쉽게 볼 수 있습니다." href="/calculator" />
        <FeatureCard title="통계" description="상위 메타 포켓몬과 자주 보이는 도구를 빠르게 파악할 수 있습니다." href="/stats" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_24px_100px_rgba(148,163,184,0.16)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">처음 시작하기 좋은 추천 조합</h2>
              <p className="mt-1 text-sm text-slate-500">샘플 파티를 누르면 바로 6칸에 채워집니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setParty(createEmptyParty())}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
            >
              파티 비우기
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {teamPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white"
              >
                <div className="font-semibold text-slate-900">{preset.name}</div>
                <div className="mt-1 text-sm text-slate-500">{preset.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {party.map((member, index) => {
              const pokemon = member ? pokemonData.find((entry) => entry.name === member) : null;

              return (
                <div key={`party-${index}`} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">슬롯 {index + 1}</div>
                  {pokemon ? (
                    <button type="button" onClick={() => setSelectedName(pokemon.name)} className="mt-3 w-full text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex size-16 items-center justify-center rounded-[1rem] bg-slate-100">
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
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pokemon.roles.slice(0, 2).map((role) => (
                          <span key={role} className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-900">
                            {toKoreanRole(role)}
                          </span>
                        ))}
                      </div>
                    </button>
                  ) : (
                    <div className="mt-3 text-sm leading-6 text-slate-500">아래 추천 포켓몬을 눌러 슬롯을 채워보세요.</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_24px_100px_rgba(148,163,184,0.16)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-24 items-center justify-center rounded-[1.5rem] bg-slate-100">
                  <PokemonThumb slugOrName={selectedPokemon.id} alt={toKoreanPokemonName(selectedPokemon.name, selectedPokemon.id)} className="size-20" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{toKoreanPokemonName(selectedPokemon.name, selectedPokemon.id)}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPokemon.types.map((type, index) => (
                      <TypeBadge
                        key={`${selectedPokemon.id}-${type}`}
                        type={type}
                        label={toKoreanTypes(selectedPokemon.types)[index]}
                        className="h-7 w-auto"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">사용률 {selectedPokemon.usage.toFixed(1)}%</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => assignToFirstEmpty(selectedPokemon.name)}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                내 파티에 넣기
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{selectedPokemon.notes}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Object.entries(selectedPokemon.baseStats).map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-slate-100 px-3 py-3">
                  <div className="text-[11px] tracking-[0.08em] text-slate-400">{key.toUpperCase()}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {selectedPokemon.sets.map((set) => (
                <div key={set.label} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white">
                      <ItemThumb slugOrName={set.item} alt={toKoreanItemName(set.item)} className="size-10" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold text-slate-900">{set.label}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {toKoreanItemName(set.item)} · {toKoreanAbilityName(set.ability)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{set.summary}</p>
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

          <section className="rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_24px_100px_rgba(148,163,184,0.16)] backdrop-blur">
            <h2 className="text-2xl font-bold tracking-tight">지금 파티에 잘 어울리는 다음 선택</h2>
            <div className="mt-4 grid gap-3">
              {analysis.suggestions.slice(0, 4).map((entry) => (
                <button
                  key={entry.pokemon.id}
                  type="button"
                  onClick={() => {
                    setSelectedName(entry.pokemon.name);
                    assignToFirstEmpty(entry.pokemon.name);
                  }}
                  className="rounded-[1.35rem] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-14 items-center justify-center rounded-[1rem] bg-slate-100">
                        <PokemonThumb slugOrName={entry.pokemon.id} alt={toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)} className="size-10" />
                      </div>
                      <div>
                        <div className="text-lg font-bold">{toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)}</div>
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
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">+{entry.score}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{entry.reasons[0]}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{label}</div>
      <div className="mt-3 text-2xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-300">{detail}</div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-orange-300/40 hover:bg-white/15"
    >
      {label}
    </Link>
  );
}

function FeatureCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-[0_24px_100px_rgba(148,163,184,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-300"
    >
      <div className="text-lg font-bold">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}

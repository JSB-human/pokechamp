"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { ItemThumb, PokemonThumb, TypeBadge } from "@/components/media";
import { teamPresets } from "@/data/champions-data";
import { analyzeParty } from "@/lib/recommendations";
import {
  toKoreanAbilityName,
  toKoreanItemName,
  toKoreanMoveName,
  toKoreanPokemonName,
  toKoreanRole,
  toKoreanTypes,
} from "@/lib/korean";
import type { CollectedOverview } from "@/types/collected-data";
import type { CatalogPokemon } from "@/types/pokemon";

const TEAM_SIZE = 6;

function createEmptyParty() {
  return Array.from({ length: TEAM_SIZE }, () => null) as Array<string | null>;
}

export function HomeDashboard({
  overview,
  catalog,
}: {
  overview: CollectedOverview;
  catalog: CatalogPokemon[];
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

  const analysis = analyzeParty(party.filter((item): item is string => Boolean(item)), catalog);
  const selectedPokemon = catalog.find((entry) => entry.name === selectedName) ?? catalog[0];

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
      <section className="hero-fade-in relative overflow-hidden rounded-[2.4rem] border border-blue-950/20 bg-[linear-gradient(135deg,#082f75_0%,#0f4cfd_48%,#0891b2_130%)] text-white shadow-[0_40px_120px_rgba(15,76,253,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,107,26,0.36),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_70%_78%,rgba(34,211,238,0.28),transparent_24%)]" />
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.20)_0_10%,transparent_11%_100%),radial-gradient(circle_at_68%_64%,rgba(255,255,255,0.14)_0_9%,transparent_10%_100%)] opacity-70 lg:block" />
        <div className="relative grid min-w-0 gap-8 px-6 py-8 lg:grid-cols-[1.25fr_0.95fr] lg:px-8 lg:py-10">
          <div className="hero-rise-in min-w-0 space-y-5">
            <span className="hero-delay-1 inline-flex max-w-full rounded-full border border-orange-200/60 bg-orange-400/25 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-orange-50">
              한국어 중심 포켓몬 챔피언스 데이터
            </span>
            <div className="hero-delay-2 space-y-3">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                처음 와도 바로 읽히는
                <br />
                챔피언스 도감과 파티 빌더
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                포켓몬, 기술, 도구, 특성을 한국어 중심으로 정리하고 챔피언스 스타일 이미지를 최대한 유지해서 데이터 사이트인데도 딱딱하지 않게 보이도록 다듬고 있습니다.
              </p>
            </div>

            <div className="hero-delay-3 flex max-w-full flex-wrap gap-3">
              <QuickLink href="/pokedex" label="포켓몬 도감" />
              <QuickLink href="/moves" label="기술 도감" />
              <QuickLink href="/type-chart" label="상성표" />
              <QuickLink href="/builder" label="파티 빌더" />
              <QuickLink href="/calculator" label="계산기" />
            </div>

            <div className="hero-delay-4 grid gap-3 sm:grid-cols-3">
              <MiniStat title="활성 도감" value={`${catalog.length}`} caption="현재 규정 기준 포켓몬" />
              <MiniStat title="기술" value={`${overview.moveCount ?? "-"}`} caption="배울 수 있는 기술 연결" />
              <MiniStat title="도구" value={`${overview.itemCount ?? "-"}`} caption="세트 구성에 바로 활용" />
            </div>
          </div>

          <div className="hero-delay-2 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <HeroStat label="포켓몬 수" value={`${overview.pokemonCount ?? "-"}`} detail="도감과 빌더에서 바로 탐색" />
            <HeroStat label="기술 수" value={`${overview.moveCount ?? "-"}`} detail="타입과 분류까지 빠르게 확인" />
            <HeroStat label="특성 수" value={`${overview.abilityCount ?? "-"}`} detail="대표 사용자와 함께 정리" />
            <HeroStat label="도구 수" value={`${overview.itemCount ?? "-"}`} detail="아이콘과 획득 정보 제공" />
          </div>
        </div>
      </section>

      <section className="hero-fade-in hero-delay-2 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FeatureCard title="포켓몬 도감" description="챔피언스 이미지, 타입 아이콘, 기본 스탯, 기술 수까지 한 화면에서 확인합니다." href="/pokedex" accent="from-orange-100 to-white" />
        <FeatureCard title="기술 도감" description="기술 이름, 타입, 분류, 위력, 명중, PP를 카드형으로 비교합니다." href="/moves" accent="from-sky-100 to-white" />
        <FeatureCard title="도구 도감" description="실제 아이콘과 획득 정보까지 함께 보여 주어 세트 구성에 바로 활용할 수 있습니다." href="/items" accent="from-amber-100 to-white" />
        <FeatureCard title="특성 도감" description="대표 사용자 포켓몬과 함께 특성을 이해하기 쉽게 정리했습니다." href="/abilities" accent="from-emerald-100 to-white" />
        <FeatureCard title="상성표" description="타입별 공격과 방어 상성을 18x18 표와 복합 타입 계산으로 바로 확인합니다." href="/type-chart" accent="from-rose-100 to-white" />
      </section>

      <section className="hero-fade-in hero-delay-3 grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="hover-lift ui-card-warm rounded-[2rem] p-6">
          <div className="inline-flex rounded-full bg-orange-600 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white shadow-sm">
            WHY POKECHAMP
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            복잡한 배틀 데이터를
            <br />
            보기 쉬운 한국어 서비스로
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            도감만 많은 사이트가 아니라, 처음 보는 사람도 바로 파티를 짜고 상성을 이해하고 세트를 읽을 수 있는 흐름을 목표로 다듬고 있습니다.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <BrandPill title="쉽게 읽기" description="용어와 구조를 한국어 중심으로 정리" />
            <BrandPill title="바로 비교" description="타입, 역할, 추천 후보를 한 번에" />
            <BrandPill title="바로 공유" description="파티 카드와 링크로 즉시 전달" />
          </div>
        </div>

        <div className="hover-lift ui-card rounded-[2rem] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">처음 쓰는 흐름</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                홈에서 바로 시작해서 파티 빌더까지 이어지는 가장 쉬운 진입 동선입니다.
              </p>
            </div>
            <Link
              href="/builder"
              className="ui-button-primary rounded-full px-4 py-2 text-sm font-bold transition"
            >
              바로 빌더 열기
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FlowCard step="1" title="포켓몬 찾기" description="도감에서 포켓몬과 기술을 먼저 훑어봅니다." />
            <FlowCard step="2" title="상성 확인" description="상성표와 상세 페이지로 약점과 저항을 확인합니다." />
            <FlowCard step="3" title="파티 완성" description="빌더에서 추천 후보를 더하고 카드로 공유합니다." />
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="ui-card rounded-[2rem] p-5 backdrop-blur">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">샘플 파티로 바로 시작하기</h2>
              <p className="mt-1 text-sm text-slate-500">샘플을 고르면 아래 파티 슬롯이 즉시 채워집니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setParty(createEmptyParty())}
              className="w-fit rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
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
                className="rounded-[1.3rem] border border-orange-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_56%)] px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-500 hover:shadow-[0_18px_40px_rgba(251,146,60,0.16)]"
              >
                <div className="font-semibold text-slate-900">{preset.name}</div>
                <div className="mt-1 text-sm text-slate-500">{preset.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {party.map((member, index) => {
              const pokemon = member ? catalog.find((entry) => entry.name === member) : null;

              return (
                <div
                  key={`party-${index}`}
                  className="rounded-[1.4rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f1f7ff_100%)] p-4 shadow-sm"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    슬롯 {index + 1}
                  </div>
                  {pokemon ? (
                    <button type="button" onClick={() => setSelectedName(pokemon.name)} className="mt-3 w-full text-left">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-[1rem] bg-slate-100">
                          <PokemonThumb
                            slugOrName={pokemon.id}
                            src={pokemon.iconUrl}
                            alt={toKoreanPokemonName(pokemon.name, pokemon.id)}
                            className="size-12"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-lg font-bold">{toKoreanPokemonName(pokemon.name, pokemon.id)}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pokemon.types.map((type, typeIndex) => (
                              <TypeBadge
                                key={`${pokemon.id}-${type}`}
                                type={type}
                                label={toKoreanTypes(pokemon.types)[typeIndex]}
                                iconUrl={pokemon.typeDetails[typeIndex]?.iconUrl}
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
                    <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
                      샘플을 누르거나 빌더에서 직접 파티를 채워 보세요.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="ui-card rounded-[2rem] p-5 backdrop-blur">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]">
                  <PokemonThumb
                    slugOrName={selectedPokemon.id}
                    src={selectedPokemon.iconUrl}
                    alt={toKoreanPokemonName(selectedPokemon.name, selectedPokemon.id)}
                    className="size-20"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold tracking-tight">{toKoreanPokemonName(selectedPokemon.name, selectedPokemon.id)}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPokemon.types.map((type, index) => (
                      <TypeBadge
                        key={`${selectedPokemon.id}-${type}`}
                        type={type}
                        label={toKoreanTypes(selectedPokemon.types)[index]}
                        iconUrl={selectedPokemon.typeDetails[index]?.iconUrl}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{selectedPokemon.usageLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => assignToFirstEmpty(selectedPokemon.name)}
                className="ui-button-primary w-fit rounded-full px-4 py-2 text-sm font-bold transition"
              >
                파티에 추가
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">{selectedPokemon.notes}</p>

            <div className="mt-5 rounded-[1.4rem] border border-orange-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ItemThumb
                    slugOrName={selectedPokemon.suggestedItem ?? "poke-ball"}
                    alt={toKoreanItemName(selectedPokemon.suggestedItem ?? "poke-ball")}
                    className="size-10"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-slate-900">
                    {selectedPokemon.setLabel ?? "대표 운용 예시"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {selectedPokemon.suggestedItem ? toKoreanItemName(selectedPokemon.suggestedItem) : "도구 미정"}
                    {selectedPokemon.suggestedAbility
                      ? ` · ${toKoreanAbilityName(selectedPokemon.suggestedAbility)}`
                      : ""}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedPokemon.setSummary ?? "대표 기술과 역할을 기준으로 운용 힌트를 제공합니다."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPokemon.featuredMoves.map((move) => (
                  <span key={move} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                    {toKoreanMoveName(move)}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="ui-card rounded-[2rem] p-5 backdrop-blur">
            <h2 className="text-2xl font-bold tracking-tight">지금 파티에 잘 맞는 추천</h2>
            <div className="mt-4 grid gap-3">
              {analysis.suggestions.slice(0, 4).map((entry) => (
                <button
                  key={entry.pokemon.id}
                  type="button"
                  onClick={() => {
                    setSelectedName(entry.pokemon.name);
                    assignToFirstEmpty(entry.pokemon.name);
                  }}
                  className="rounded-[1.4rem] border border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-[0_18px_40px_rgba(16,185,129,0.16)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-14 items-center justify-center rounded-[1rem] bg-slate-100">
                        <PokemonThumb
                          slugOrName={entry.pokemon.id}
                          src={entry.pokemon.iconUrl}
                          alt={toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)}
                          className="size-10"
                        />
                      </div>
                      <div>
                        <div className="text-lg font-bold">{toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {entry.pokemon.types.map((type, index) => (
                            <TypeBadge
                              key={`${entry.pokemon.id}-${type}`}
                              type={type}
                              label={toKoreanTypes(entry.pokemon.types)[index]}
                              iconUrl={entry.pokemon.typeDetails[index]?.iconUrl}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                      +{entry.score.toFixed(0)}
                    </span>
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
    <div className="hover-lift rounded-[1.5rem] border border-white/25 bg-white/16 p-4 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-50">{label}</div>
      <div className="mt-3 text-2xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-blue-50">{detail}</div>
    </div>
  );
}

function MiniStat({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="hover-lift rounded-[1.3rem] border border-white/25 bg-white/16 px-4 py-3 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-50">{title}</div>
      <div className="mt-2 text-xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-blue-50">{caption}</div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="hover-lift rounded-full border border-white/35 bg-white/18 px-4 py-2 text-sm font-bold text-white transition hover:border-orange-200 hover:bg-white/26"
    >
      {label}
    </Link>
  );
}

function FeatureCard({
  title,
  description,
  href,
  accent,
}: {
  title: string;
  description: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`hover-lift rounded-[1.8rem] border border-blue-100 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${accent} p-5 shadow-[0_18px_55px_rgba(15,45,122,0.10)] transition hover:border-blue-500`}
    >
      <div className="text-lg font-extrabold text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </Link>
  );
}

function BrandPill({ title, description }: { title: string; description: string }) {
  return (
    <div className="hover-lift rounded-[1.4rem] border border-orange-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-600">{description}</div>
    </div>
  );
}

function FlowCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="hover-lift rounded-[1.5rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f1f7ff_100%)] p-5 shadow-sm">
      <div className="inline-flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {step}
      </div>
      <div className="mt-4 text-lg font-bold text-slate-950">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-600">{description}</div>
    </div>
  );
}

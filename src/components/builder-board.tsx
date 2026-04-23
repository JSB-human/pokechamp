"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { PokemonThumb, TypeBadge } from "@/components/media";
import { toKoreanItemName, toKoreanPokemonName, toKoreanRole, toKoreanTypes } from "@/lib/korean";
import { analyzeParty } from "@/lib/recommendations";
import { ALL_TYPES } from "@/lib/type-chart";
import type { CatalogPokemon } from "@/types/pokemon";

const slots = 6;
const STORAGE_KEY = "pokechamp:builder-party";
const DEFAULT_PARTY: Array<string | null> = ["Sneasler", "Incineroar", "Pelipper", null, null, null];

export function BuilderBoard({ catalog }: { catalog: CatalogPokemon[] }) {
  const [party, setParty] = useState<Array<string | null>>(() => resolveInitialParty(catalog));
  const [query, setQuery] = useState("");
  const [shareState, setShareState] = useState<string>(() => resolveInitialShareState(catalog));
  const [importText, setImportText] = useState("");
  const deferredQuery = useDeferredValue(query);
  const keyword = deferredQuery.trim().toLowerCase();
  const catalogByName = useMemo(() => new Map(catalog.map((entry) => [entry.name, entry])), [catalog]);

  const analysis = analyzeParty(party.filter((entry): entry is string => Boolean(entry)), catalog);
  const defensiveRows = ALL_TYPES.map((type) => {
    const weak = analysis.selected.filter((pokemon) => pokemon.weaknesses.includes(type)).length;
    const resist = analysis.selected.filter((pokemon) => pokemon.resists.includes(type)).length;
    return { type, weak, resist };
  }).filter((entry) => entry.weak > 0 || entry.resist > 0);

  const filteredCatalog = catalog.filter((pokemon) => {
    if (!keyword) {
      return true;
    }

    return (
      toKoreanPokemonName(pokemon.name, pokemon.id).toLowerCase().includes(keyword) ||
      pokemon.name.toLowerCase().includes(keyword) ||
      pokemon.types.some((type) => toKoreanTypes([type])[0].toLowerCase().includes(keyword))
    );
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(party));

    const ids = party
      .map((entry) => (entry ? catalogByName.get(entry)?.id ?? null : null))
      .filter((entry): entry is string => Boolean(entry));

    const params = new URLSearchParams(window.location.search);
    if (ids.length > 0) {
      params.set("party", ids.join(","));
    } else {
      params.delete("party");
    }

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [catalogByName, party]);

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

  function moveSlot(index: number, direction: -1 | 1) {
    startTransition(() => {
      setParty((current) => {
        const target = index + direction;
        if (target < 0 || target >= slots) {
          return current;
        }

        const next = [...current];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
      setShareState(direction === -1 ? "포켓몬을 앞으로 이동했습니다." : "포켓몬을 뒤로 이동했습니다.");
    });
  }

  async function copyShareLink() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareState("공유 링크를 클립보드에 복사했습니다.");
    } catch {
      setShareState("클립보드 복사에 실패했습니다. 주소창 링크를 직접 복사해 주세요.");
    }
  }

  function resetParty() {
    startTransition(() => {
      setParty(DEFAULT_PARTY);
      setShareState("기본 파티로 되돌렸습니다.");
    });
  }

  async function copyPartySummary() {
    const summary = [
      "포켓몬 챔피언스 파티",
      analysis.selected.map((pokemon) => `- ${toKoreanPokemonName(pokemon.name, pokemon.id)}`).join("\n"),
      `역할: ${analysis.roleCoverage.map((role) => toKoreanRole(role)).join(", ") || "없음"}`,
      `겹치는 약점: ${
        analysis.sharedWeaknesses.map((entry) => `${toKoreanTypes([entry.type])[0]} ${entry.count}`).join(", ") || "없음"
      }`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(summary);
      setShareState("파티 요약 텍스트를 클립보드에 복사했습니다.");
    } catch {
      setShareState("파티 요약 복사에 실패했습니다.");
    }
  }

  function printShareCard() {
    if (typeof window === "undefined") {
      return;
    }

    window.print();
  }

  function downloadPartyCard() {
    if (typeof window === "undefined") {
      return;
    }

    const title = "Pokechamp Party Card";
    const names = party.map((member, index) => {
      const pokemon = member ? catalog.find((entry) => entry.name === member) : null;
      return `${index + 1}. ${pokemon ? toKoreanPokemonName(pokemon.name, pokemon.id) : "빈 슬롯"}`;
    });
    const roles = analysis.roleCoverage.map((role) => toKoreanRole(role)).join(", ") || "역할 분석 대기";
    const weaknesses =
      analysis.sharedWeaknesses.map((entry) => `${toKoreanTypes([entry.type])[0]} ${entry.count}`).join(", ") ||
      "크게 겹치는 약점 없음";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="52%" stop-color="#111827" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width="1200" height="628" rx="36" fill="url(#bg)" />
        <circle cx="180" cy="120" r="120" fill="rgba(249,115,22,0.16)" />
        <circle cx="1040" cy="120" r="110" fill="rgba(255,255,255,0.08)" />
        <text x="72" y="86" fill="#fdba74" font-size="22" font-family="Arial, sans-serif" font-weight="700">POKECHAMP PARTY CARD</text>
        <text x="72" y="150" fill="#ffffff" font-size="44" font-family="Arial, sans-serif" font-weight="700">${escapeXml(title)}</text>
        <text x="72" y="196" fill="#cbd5e1" font-size="22" font-family="Arial, sans-serif">포켓몬 챔피언스 파티 요약</text>

        ${names
          .map(
            (line, index) => `
              <rect x="72" y="${236 + index * 54}" width="500" height="40" rx="20" fill="rgba(255,255,255,0.10)" />
              <text x="92" y="${262 + index * 54}" fill="#ffffff" font-size="22" font-family="Arial, sans-serif">${escapeXml(line)}</text>
            `,
          )
          .join("")}

        <rect x="650" y="232" width="478" height="126" rx="28" fill="rgba(255,255,255,0.10)" />
        <text x="684" y="276" fill="#fdba74" font-size="20" font-family="Arial, sans-serif" font-weight="700">역할</text>
        <text x="684" y="318" fill="#ffffff" font-size="28" font-family="Arial, sans-serif">${escapeXml(roles)}</text>

        <rect x="650" y="382" width="478" height="126" rx="28" fill="rgba(255,255,255,0.10)" />
        <text x="684" y="426" fill="#86efac" font-size="20" font-family="Arial, sans-serif" font-weight="700">겹치는 약점</text>
        <text x="684" y="468" fill="#ffffff" font-size="24" font-family="Arial, sans-serif">${escapeXml(weaknesses)}</text>
      </svg>
    `.trim();

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pokechamp-party-card.svg";
    link.click();
    URL.revokeObjectURL(url);
    setShareState("파티 카드 이미지를 SVG 파일로 저장했습니다.");
  }

  async function downloadPartyCardPng() {
    if (typeof window === "undefined") {
      return;
    }

    const title = "Pokechamp Party Card";
    const names = party.map((member, index) => {
      const pokemon = member ? catalog.find((entry) => entry.name === member) : null;
      return `${index + 1}. ${pokemon ? toKoreanPokemonName(pokemon.name, pokemon.id) : "빈 슬롯"}`;
    });
    const roles = analysis.roleCoverage.map((role) => toKoreanRole(role)).join(", ") || "역할 분석 대기 중";
    const weaknesses =
      analysis.sharedWeaknesses.map((entry) => `${toKoreanTypes([entry.type])[0]} ${entry.count}`).join(", ") ||
      "크게 겹치는 약점 없음";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628">
        <defs>
          <linearGradient id="bg-png" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="52%" stop-color="#111827" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width="1200" height="628" rx="36" fill="url(#bg-png)" />
        <circle cx="180" cy="120" r="120" fill="rgba(249,115,22,0.16)" />
        <circle cx="1040" cy="120" r="110" fill="rgba(255,255,255,0.08)" />
        <text x="72" y="86" fill="#fdba74" font-size="22" font-family="Arial, sans-serif" font-weight="700">POKECHAMP PARTY CARD</text>
        <text x="72" y="150" fill="#ffffff" font-size="44" font-family="Arial, sans-serif" font-weight="700">${escapeXml(title)}</text>
        <text x="72" y="196" fill="#cbd5e1" font-size="22" font-family="Arial, sans-serif">포켓몬 챔피언스 파티 요약</text>

        ${names
          .map(
            (line, index) => `
              <rect x="72" y="${236 + index * 54}" width="500" height="40" rx="20" fill="rgba(255,255,255,0.10)" />
              <text x="92" y="${262 + index * 54}" fill="#ffffff" font-size="22" font-family="Arial, sans-serif">${escapeXml(line)}</text>
            `,
          )
          .join("")}

        <rect x="650" y="232" width="478" height="126" rx="28" fill="rgba(255,255,255,0.10)" />
        <text x="684" y="276" fill="#fdba74" font-size="20" font-family="Arial, sans-serif" font-weight="700">역할</text>
        <text x="684" y="318" fill="#ffffff" font-size="28" font-family="Arial, sans-serif">${escapeXml(roles)}</text>

        <rect x="650" y="382" width="478" height="126" rx="28" fill="rgba(255,255,255,0.10)" />
        <text x="684" y="426" fill="#86efac" font-size="20" font-family="Arial, sans-serif" font-weight="700">겹치는 약점</text>
        <text x="684" y="468" fill="#ffffff" font-size="24" font-family="Arial, sans-serif">${escapeXml(weaknesses)}</text>
      </svg>
    `.trim();

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    try {
      const image = await loadSvgImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 628;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context unavailable");
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
            return;
          }

          reject(new Error("PNG export failed"));
        }, "image/png");
      });

      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "pokechamp-party-card.png";
      link.click();
      URL.revokeObjectURL(pngUrl);
      setShareState("파티 카드 이미지를 PNG 파일로 저장했습니다.");
    } catch {
      setShareState("PNG 저장 중 문제가 생겨 SVG 저장을 대신 준비했습니다.");
      downloadPartyCard();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function copyExportText() {
    const exported = analysis.selected.map((pokemon) => pokemon.id).join(", ");

    try {
      await navigator.clipboard.writeText(exported);
      setShareState("파티 내보내기 텍스트를 복사했습니다.");
    } catch {
      setShareState("파티 내보내기 복사에 실패했습니다.");
    }
  }

  function importParty() {
    const tokens = importText
      .split(/[\n,\t/|]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      setShareState("가져올 파티 텍스트를 먼저 입력해 주세요.");
      return;
    }

    const nextMembers = tokens
      .map((token) => {
        const normalized = token.toLowerCase();
        const byId = catalog.find((entry) => entry.id === normalized);
        if (byId) {
          return byId.name;
        }

        const byKorean = catalog.find(
          (entry) => toKoreanPokemonName(entry.name, entry.id).toLowerCase() === normalized,
        );
        if (byKorean) {
          return byKorean.name;
        }

        const byEnglish = catalog.find((entry) => entry.name.toLowerCase() === normalized);
        return byEnglish?.name ?? null;
      })
      .filter((entry): entry is string => Boolean(entry));

    if (nextMembers.length === 0) {
      setShareState("입력한 텍스트에서 인식된 포켓몬이 없었습니다.");
      return;
    }

    startTransition(() => {
      setParty(normalizeParty(nextMembers));
      setShareState(`파티 ${Math.min(nextMembers.length, slots)}마리를 불러왔습니다.`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="ui-card rounded-[1.9rem] p-5">
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold">내 파티</h2>
              <p className="mt-1 text-sm text-slate-500">
                슬롯을 채우면 타입 약점, 역할 겹침, 추천 포켓몬을 바로 계산합니다.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={copyShareLink}
                className="ui-button-soft rounded-full px-4 py-2 text-sm font-bold transition hover:border-blue-500 hover:bg-blue-50"
              >
                공유 링크 복사
              </button>
              <button
                type="button"
                onClick={resetParty}
                className="ui-button-primary rounded-full px-4 py-2 text-sm font-bold transition"
              >
                기본 파티로 되돌리기
              </button>
            </div>
          </div>
          <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {shareState}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: slots }, (_, index) => {
              const member = party[index];
              const pokemon = member ? catalog.find((entry) => entry.name === member) : null;

              return (
                <div
                  key={index}
                  className="min-w-0 rounded-[1.35rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f1f7ff_100%)] p-4 shadow-[0_10px_30px_rgba(15,45,122,0.08)]"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    슬롯 {index + 1}
                  </div>
                  {pokemon ? (
                    <>
                      <div className="mt-3 flex min-w-0 items-center gap-3">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-[1rem] bg-slate-100">
                          <PokemonThumb
                            slugOrName={pokemon.id}
                            src={pokemon.iconUrl}
                            alt={toKoreanPokemonName(pokemon.name, pokemon.id)}
                            className="size-12"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-lg font-bold">
                            {toKoreanPokemonName(pokemon.name, pokemon.id)}
                          </div>
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
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => moveSlot(index, -1)}
                          disabled={index === 0}
                          className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700 transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          앞으로
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSlot(index, 1)}
                          disabled={index === slots - 1}
                          className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700 transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          뒤로
                        </button>
                        <button
                          type="button"
                          onClick={() => removePokemon(index)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 transition hover:border-rose-500"
                        >
                          비우기
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
                      오른쪽 검색 목록에서 눌러 추가해 주세요.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_100%)] p-5 shadow-sm">
          <h2 className="text-2xl font-bold">파티 분석</h2>
          <div className="mt-4 space-y-4">
            <SummaryBlock
              title="채워진 역할"
              values={analysis.roleCoverage.map((role) => toKoreanRole(role))}
              emptyText="아직 역할 분석 데이터가 부족합니다."
            />
            <SummaryBlock
              title="겹치는 약점"
              values={analysis.sharedWeaknesses.map(
                (entry) => `${toKoreanTypes([entry.type])[0]} ${entry.count}`,
              )}
              emptyText="현재 크게 겹치는 약점은 없습니다."
            />
            <SummaryBlock
              title="중복 추천 도구"
              values={analysis.duplicateItems.map((entry) => `${toKoreanItemName(entry.item)} ${entry.count}`)}
              emptyText="중복된 대표 도구는 없습니다."
            />
            <SummaryBlock
              title="메타 주의 포켓몬"
              values={analysis.topChecks.map((entry) => `${entry.name} ${entry.count.toFixed(0)}`)}
              emptyText="아직 주의 포켓몬 데이터를 계산하지 못했습니다."
            />
          </div>
        </section>
      </div>

      <section className="ui-card rounded-[1.9rem] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">파티 가져오기 / 내보내기</h2>
            <p className="mt-1 text-sm text-slate-500">
              한국어 이름, 영문 이름, 슬러그를 쉼표나 줄바꿈으로 붙여 넣으면 바로 파티로 불러올 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={copyExportText}
            className="ui-button-soft rounded-full px-4 py-2 text-sm font-bold transition hover:border-blue-500 hover:bg-blue-50"
          >
            현재 파티 내보내기 복사
          </button>
        </div>
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[1fr_auto]">
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={"예: sneasler, incineroar, pelipper\n또는\n포푸니크\n어흥염\n펠리퍼"}
            className="min-h-32 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 outline-none transition focus:border-orange-300 focus:bg-white"
          />
          <div className="flex flex-col gap-2 lg:min-w-32">
            <button
              type="button"
              onClick={importParty}
              className="ui-button-primary rounded-full px-4 py-2 text-sm font-bold transition"
            >
              파티 불러오기
            </button>
            <button
              type="button"
              onClick={() => setImportText("")}
              className="ui-button-soft rounded-full px-4 py-2 text-sm font-bold transition hover:border-slate-500"
            >
              입력 지우기
            </button>
          </div>
        </div>
      </section>

      <section className="ui-card-warm rounded-[1.9rem] p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">파티 상성 요약</h2>
            <p className="mt-1 text-sm text-slate-500">
              현재 파티가 어떤 타입 공격에 약한지, 어떤 타입은 비교적 잘 받는지 한눈에 확인할 수 있습니다.
            </p>
          </div>
          <a
            href="/type-chart"
            className="text-sm font-semibold text-orange-600 transition hover:text-orange-700"
          >
            전체 상성표 보기
          </a>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {defensiveRows.map((entry) => (
            <div
              key={entry.type}
              className="rounded-[1.35rem] border border-orange-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <TypeBadge type={entry.type} label={toKoreanTypes([entry.type])[0]} />
                <span className="text-xs font-semibold text-slate-400">방어 기준</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-rose-50 px-3 py-3 text-center">
                  <div className="text-xs font-semibold text-rose-500">취약</div>
                  <div className="mt-1 text-lg font-bold text-rose-900">{entry.weak}</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-3 text-center">
                  <div className="text-xs font-semibold text-emerald-500">저항</div>
                  <div className="mt-1 text-lg font-bold text-emerald-900">{entry.resist}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#111827_48%,#1d4ed8_130%)] p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">공유 카드 미리보기</h2>
            <p className="mt-1 text-sm text-slate-300">
              지금 파티를 카드처럼 정리해 두었습니다. 스크린샷을 찍거나 요약 텍스트를 복사해서 공유하기 좋습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPartySummary}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              파티 요약 복사
            </button>
            <button
              type="button"
              onClick={printShareCard}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-50"
            >
              카드 인쇄하기
            </button>
            <button
              type="button"
              onClick={downloadPartyCard}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              SVG로 저장하기
            </button>
          </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={downloadPartyCardPng}
              className="rounded-full border border-orange-300/35 bg-orange-400/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-400/25"
            >
              PNG로 저장하기
            </button>
          </div>

        <div className="mt-5 rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.24em] text-orange-200">POKECHAMP PARTY CARD</div>
              <div className="mt-2 text-3xl font-bold">내 파티 요약</div>
              <div className="mt-2 text-sm text-slate-300">
                {analysis.selected.length}마리 구성 · 역할 {analysis.roleCoverage.length}개 확보
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.roleCoverage.length > 0 ? (
                analysis.roleCoverage.map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {toKoreanRole(role)}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  역할 분석 대기
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {party.map((member, index) => {
              const pokemon = member ? catalog.find((entry) => entry.name === member) : null;

              return (
                <div
                  key={`share-${index}`}
                  className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-300">슬롯 {index + 1}</div>
                  {pokemon ? (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex size-16 items-center justify-center rounded-[1rem] bg-white/10">
                        <PokemonThumb
                          slugOrName={pokemon.id}
                          src={pokemon.iconUrl}
                          alt={toKoreanPokemonName(pokemon.name, pokemon.id)}
                          className="size-12"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-bold text-white">
                          {toKoreanPokemonName(pokemon.name, pokemon.id)}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {pokemon.types.map((type, typeIndex) => (
                            <TypeBadge
                              key={`${pokemon.id}-share-${type}`}
                              type={type}
                              label={toKoreanTypes(pokemon.types)[typeIndex]}
                              iconUrl={pokemon.typeDetails[typeIndex]?.iconUrl}
                              className="border-white/10"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-dashed border-white/15 px-4 py-6 text-sm text-slate-300">
                      빈 슬롯
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[1.35rem] bg-white/10 p-4">
              <div className="text-sm font-semibold text-orange-200">겹치는 약점</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.sharedWeaknesses.length > 0 ? (
                  analysis.sharedWeaknesses.map((entry) => (
                    <span
                      key={`share-weak-${entry.type}`}
                      className="rounded-full bg-rose-200 px-3 py-1 text-xs font-semibold text-rose-950"
                    >
                      {toKoreanTypes([entry.type])[0]} {entry.count}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-300">크게 겹치는 약점이 없습니다.</span>
                )}
              </div>
            </div>
            <div className="rounded-[1.35rem] bg-white/10 p-4">
              <div className="text-sm font-semibold text-emerald-200">추천 후보</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.suggestions.slice(0, 3).map((entry) => (
                  <span
                    key={`share-suggestion-${entry.pokemon.id}`}
                    className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-950"
                  >
                    {toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ui-card rounded-[1.9rem] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">검색해서 바로 추가하기</h2>
            <p className="mt-1 text-sm text-slate-500">포켓몬 이름이나 타입으로 검색해서 한 번에 파티를 채워 보세요.</p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 리자몽, 포푸니크, 물"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white md:max-w-sm"
          />
        </div>

        <div className="mt-5 rounded-[1.45rem] border border-slate-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">추천 포켓몬</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              현재 파티 기준
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {analysis.suggestions.map((entry) => (
              <button
                key={entry.pokemon.id}
                type="button"
                onClick={() => addPokemon(entry.pokemon.name)}
              className="rounded-[1.35rem] border border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-[0_18px_40px_rgba(16,185,129,0.16)]"
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-[1rem] bg-slate-100">
                      <PokemonThumb
                        slugOrName={entry.pokemon.id}
                        src={entry.pokemon.iconUrl}
                        alt={toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)}
                        className="size-10"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{toKoreanPokemonName(entry.pokemon.name, entry.pokemon.id)}</div>
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
                  <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    +{entry.score.toFixed(0)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{entry.reasons[0]}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredCatalog.slice(0, 32).map((pokemon) => (
            <button
              key={pokemon.id}
              type="button"
              onClick={() => addPokemon(pokemon.name)}
              className="rounded-[1.35rem] border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-[0_18px_40px_rgba(15,76,253,0.12)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-[1rem] bg-slate-100">
                  <PokemonThumb
                    slugOrName={pokemon.id}
                    src={pokemon.iconUrl}
                    alt={toKoreanPokemonName(pokemon.name, pokemon.id)}
                    className="size-10"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{toKoreanPokemonName(pokemon.name, pokemon.id)}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pokemon.types.map((type, index) => (
                      <TypeBadge
                        key={`${pokemon.id}-${type}`}
                        type={type}
                        label={toKoreanTypes(pokemon.types)[index]}
                        iconUrl={pokemon.typeDetails[index]?.iconUrl}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    기술 {pokemon.moveCount}개 · {pokemon.usageLabel}
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
            <span key={value} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
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

function normalizeParty(values: string[]) {
  const unique = Array.from(new Set(values)).slice(0, slots);
  return [...unique, ...Array.from({ length: Math.max(0, slots - unique.length) }, () => null)];
}

function resolveInitialParty(catalog: CatalogPokemon[]) {
  if (typeof window === "undefined") {
    return DEFAULT_PARTY;
  }

  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]));
  const catalogByName = new Map(catalog.map((entry) => [entry.name, entry]));
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("party");

  if (fromQuery) {
    return normalizeParty(
      fromQuery
        .split(",")
        .map((entry) => catalogById.get(entry)?.name ?? null)
        .filter((entry): entry is string => Boolean(entry)),
    );
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_PARTY;
  }

  try {
    const parsed = JSON.parse(stored) as Array<string | null>;
    return normalizeParty(
      parsed
        .map((entry) => (entry && catalogByName.has(entry) ? entry : null))
        .filter((entry): entry is string => Boolean(entry)),
    );
  } catch {
    return DEFAULT_PARTY;
  }
}

function resolveInitialShareState(catalog: CatalogPokemon[]) {
  if (typeof window === "undefined") {
    return "저장과 공유는 자동으로 준비됩니다.";
  }

  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]));
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("party");

  if (fromQuery) {
    const resolved = fromQuery
      .split(",")
      .map((entry) => catalogById.get(entry)?.name ?? null)
      .filter((entry): entry is string => Boolean(entry));
    if (resolved.length > 0) {
      return "공유 링크에서 파티를 불러왔습니다.";
    }
  }

  if (window.localStorage.getItem(STORAGE_KEY)) {
    return "지난번에 저장된 파티를 불러왔습니다.";
  }

  return "저장과 공유는 자동으로 준비됩니다.";
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function loadSvgImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("SVG image load failed"));
    image.src = url;
  });
}

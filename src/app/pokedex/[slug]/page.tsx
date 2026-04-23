import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DataPageShell } from "@/components/data-page-shell";
import { pokemonData } from "@/data/champions-data";
import { ItemThumb, PokemonThumb, TypeBadge } from "@/components/media";
import { PokemonDetailBrowser } from "@/components/pokemon-detail-browser";
import {
  getCollectedPokemon,
  getCollectedAbilities,
  getCollectedMoves,
  getCollectedPokemonBySlug,
  getCollectedPokemonLearnset,
} from "@/lib/collected-data";
import { buildPokemonDetailInsights } from "@/lib/pokemon-insights";
import { getBaseSlugForMegaForm, getCatalogPokemon, isMegaForm } from "@/lib/pokemon-catalog";
import {
  toKoreanAbilityDescription,
  toKoreanAbilityName,
  toKoreanDamageClass,
  toKoreanItemName,
  toKoreanMoveDescription,
  toKoreanMoveName,
  toKoreanPokemonDescription,
  toKoreanPokemonName,
  toKoreanRole,
  toKoreanStat,
  toKoreanType,
  toKoreanTypes,
} from "@/lib/korean";

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isMegaForm(slug)) {
    redirect(`/pokedex/${getBaseSlugForMegaForm(slug)}`);
  }

  const pokemon = getCollectedPokemonBySlug(slug);
  const learnset = getCollectedPokemonLearnset(slug);
  const allPokemon = getCollectedPokemon();
  const pokemonIndex = allPokemon
    .filter((entry) => entry.regulationSets.length > 0 && !isMegaForm(entry.slug, entry.name))
    .sort((left, right) => {
      if (left.nationalNumber !== right.nationalNumber) {
        return left.nationalNumber - right.nationalNumber;
      }

      return left.name.localeCompare(right.name);
    });
  const catalog = getCatalogPokemon();
  const catalogEntry = catalog.find((entry) => entry.id === slug) ?? null;
  const pokemonDescription = toKoreanPokemonDescription(
    pokemon?.slug,
    "포켓몬 챔피언스 기준 데이터를 정리한 포켓몬 설명입니다.",
  );

  if (!pokemon || pokemon.regulationSets.length === 0) {
    notFound();
  }

  const overlayEntry =
    pokemonData.find((entry) => entry.id === slug || entry.name === pokemon.name) ?? null;
  const megaForms = pokemon.megaVariants.map((mega) => {
    const formEntry =
      allPokemon.find(
        (entry) =>
          entry.nationalNumber === pokemon.nationalNumber &&
          isMegaForm(entry.slug, entry.name) &&
          sameStats(entry.baseStats, mega.stats),
      ) ?? null;

    return {
      ...mega,
      slug: formEntry?.slug ?? mega.megaStoneSlug ?? `${pokemon.slug}-mega`,
      name: formEntry?.name ?? `Mega ${pokemon.name}`,
      iconUrl: formEntry?.iconUrl ?? pokemon.iconUrl,
      types: (formEntry?.types ?? pokemon.types) as typeof pokemon.types,
      typeDetails: formEntry?.typeDetails ?? pokemon.typeDetails,
    };
  });
  const currentIndex = pokemonIndex.findIndex((entry) => entry.slug === pokemon.slug);
  const previousPokemon = currentIndex > 0 ? pokemonIndex[currentIndex - 1] : null;
  const nextPokemon = currentIndex >= 0 && currentIndex < pokemonIndex.length - 1 ? pokemonIndex[currentIndex + 1] : null;

  const abilityCandidates = getCollectedAbilities()
    .filter((ability) => ability.pokemon.includes(pokemon.name))
    .slice(0, 4)
    .map((ability) => ({
      slug: ability.slug,
      name: toKoreanAbilityName(ability.name, ability.slug),
      description: toKoreanAbilityDescription(ability.description, ability.slug, ability.name),
    }));
  const insights = catalogEntry
    ? buildPokemonDetailInsights({
        pokemon: catalogEntry,
        learnset,
        catalog,
        allMoves: getCollectedMoves(),
      })
    : null;

  const moves = (learnset?.moves ?? []).map((move) => ({
    slug: move.slug,
    displayName: toKoreanMoveName(move.name, move.slug),
    displayType: toKoreanType(move.type ?? "unknown"),
    rawType: move.type ?? "unknown",
    typeIconUrl: move.typeIconUrl,
    displayDamageClass: toKoreanDamageClass(move.damageClass),
    rawDamageClass: move.damageClass,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    description: toKoreanMoveDescription(move.description, move.slug, move.name),
  }));

  return (
    <DataPageShell
      eyebrow="포켓몬 상세"
      title={toKoreanPokemonName(pokemon.name, pokemon.slug)}
      description="포켓몬 챔피언스에서 확인된 이미지와 타입 정보를 그대로 사용하고, 배울 수 있는 기술과 추천 운용 힌트까지 함께 보여 줍니다."
      stats={[
        { label: "전국도감 번호", value: `${pokemon.nationalNumber}` },
        { label: "배울 수 있는 기술", value: `${learnset?.moveCount ?? 0}` },
        { label: "추천 점수", value: catalogEntry?.usageLabel ?? "-" },
        { label: "규정 세트", value: pokemon.regulationSets.join(", ") || "기본" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start gap-6 rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5">
          <div className="flex size-36 items-center justify-center rounded-[1.8rem] bg-white">
            <PokemonThumb
              slugOrName={pokemon.slug}
              src={pokemon.iconUrl}
              alt={toKoreanPokemonName(pokemon.name, pokemon.slug)}
              className="size-28"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold tracking-[0.18em] text-slate-400">
                도감번호 {pokemon.nationalNumber}
              </div>
              <div className="flex flex-wrap gap-2">
                {pokemon.typeDetails.map((type) => (
                  <TypeBadge
                    key={`${pokemon.slug}-${type.slug}`}
                    type={type.name}
                    label={toKoreanType(type.name)}
                    iconUrl={type.iconUrl}
                  />
                ))}
              </div>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">{pokemonDescription}</p>
            </div>
            {catalogEntry ? (
              <div className="flex flex-wrap gap-2">
                {catalogEntry.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900"
                  >
                    {toKoreanRole(role)}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {Object.entries(pokemon.baseStats).map(([stat, value]) => (
                <div key={stat} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                  <div className="text-[11px] tracking-[0.08em] text-slate-400">{toKoreanStat(stat)}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/pokedex"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
              >
                도감으로 돌아가기
              </Link>
              <Link
                href={`/builder?party=${pokemon.slug}`}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                이 포켓몬으로 빌더 열기
              </Link>
            </div>
          </div>
        </div>

        {megaForms.length > 0 ? (
          <section className="rounded-[1.8rem] border border-orange-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#eff6ff_100%)] p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-600">Mega Evolution</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">메가진화 상태</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  메가진화는 별도 포켓몬으로 나누지 않고, 같은 포켓몬의 전투 중 상태 변화로 확인합니다. 기술 목록은 일반 상태와 동일하게 사용합니다.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-orange-700 shadow-sm">
                {megaForms.length}개 형태
              </span>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {megaForms.map((mega) => (
                <article key={`${pokemon.slug}-${mega.slug}`} className="rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-[1.25rem] bg-orange-50">
                      <PokemonThumb
                        slugOrName={mega.slug}
                        src={mega.iconUrl}
                        alt={toKoreanPokemonName(mega.name, mega.slug)}
                        className="size-20"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">
                          {toKoreanPokemonName(mega.name, mega.slug)}
                        </h3>
                        {mega.megaStoneName ? (
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">
                            {toKoreanItemName(mega.megaStoneName, mega.megaStoneSlug ?? undefined)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mega.typeDetails.map((type) => (
                          <TypeBadge key={`${mega.slug}-${type.slug}`} type={type.name} label={toKoreanType(type.name)} iconUrl={type.iconUrl} />
                        ))}
                      </div>
                      <div className="mt-3 rounded-2xl bg-sky-50 p-3 text-sm">
                        <span className="font-black text-sky-700">특성 </span>
                        <span className="font-semibold text-slate-800">
                          {mega.abilityName ? toKoreanAbilityName(mega.abilityName, mega.abilitySlug ?? undefined) : "확인 필요"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                    {Object.entries(mega.stats).map(([stat, value]) => (
                      <div key={`${mega.slug}-${stat}`} className="rounded-2xl bg-slate-50 px-3 py-3">
                        <div className="text-[11px] tracking-[0.08em] text-slate-400">{toKoreanStat(stat)}</div>
                        <div className="mt-1 text-sm font-black text-slate-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {insights ? (
          <section className="rounded-[1.8rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f1f7ff_100%)] p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">Matchup Guide</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">상대·기술 추천 가이드</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  타입 상성, 배울 수 있는 기술, 현재 카탈로그 포켓몬을 기준으로 자동 계산한 빠른 참고표입니다.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-sm">
                자동 분석
              </span>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <InsightPokemonList title="강한 포켓몬" tone="blue" entries={insights.strongPokemon} />
              <InsightPokemonList title="주의할 포켓몬" tone="rose" entries={insights.weakPokemon} />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <InsightMoveList title="강한 기술" tone="emerald" entries={insights.strongMoves} />
              <InsightMoveList title="주의할 기술" tone="amber" entries={insights.weakMoves} />
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-black text-slate-950">추천 기술 조합</h3>
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                {insights.moveCombos.map((combo) => (
                  <article key={combo.title} className="rounded-2xl bg-slate-50 p-4">
                    <div className="font-black text-slate-950">{combo.title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{combo.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {combo.moves.map((move) => (
                        <span key={`${combo.title}-${move}`} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-800 shadow-sm">
                          {toKoreanMoveName(move)}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <Link
            href={previousPokemon ? `/pokedex/${previousPokemon.slug}` : "/pokedex"}
            className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300"
          >
            <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">이전 포켓몬</div>
            <div className="mt-2 text-lg font-bold text-slate-950">
              {previousPokemon ? toKoreanPokemonName(previousPokemon.name, previousPokemon.slug) : "도감 목록으로"}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {previousPokemon ? `도감번호 ${previousPokemon.nationalNumber}` : "전체 포켓몬 목록으로 돌아갑니다."}
            </div>
          </Link>
          <Link
            href={nextPokemon ? `/pokedex/${nextPokemon.slug}` : "/pokedex"}
            className="rounded-[1.4rem] border border-slate-200 bg-white p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300"
          >
            <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">다음 포켓몬</div>
            <div className="mt-2 text-lg font-bold text-slate-950">
              {nextPokemon ? toKoreanPokemonName(nextPokemon.name, nextPokemon.slug) : "도감 목록으로"}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {nextPokemon ? `도감번호 ${nextPokemon.nationalNumber}` : "다른 포켓몬을 다시 찾아볼 수 있습니다."}
            </div>
          </Link>
        </section>

        {catalogEntry ? (
          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">추천 운용</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {catalogEntry.setSummary ?? catalogEntry.notes}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-900">
                  추천 도구: {catalogEntry.suggestedItem ? toKoreanItemName(catalogEntry.suggestedItem) : "미정"}
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-900">
                  추천 특성: {catalogEntry.suggestedAbility ? toKoreanAbilityName(catalogEntry.suggestedAbility) : "미정"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {catalogEntry.featuredMoves.map((move) => (
                  <span key={move} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {toKoreanMoveName(move)}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">확인된 특성</h2>
              <div className="mt-4 grid gap-3">
                {abilityCandidates.length > 0 ? (
                  abilityCandidates.map((ability) => (
                    <div key={ability.slug} className="rounded-2xl bg-slate-50 p-4">
                      <div className="font-semibold text-slate-900">{ability.name}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{ability.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    현재 수집된 특성 정보가 아직 연결되지 않았습니다.
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {catalogEntry ? (
          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-5 shadow-sm">
              <h2 className="text-xl font-bold">상성 요약</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-rose-50 p-4">
                  <div className="text-sm font-semibold text-rose-600">조심할 타입</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {catalogEntry.weaknesses.map((type) => (
                      <TypeBadge
                        key={`weak-${type}`}
                        type={type}
                        label={toKoreanType(type)}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-sm font-semibold text-emerald-600">받기 편한 타입</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {catalogEntry.resists.map((type) => (
                      <TypeBadge
                        key={`resist-${type}`}
                        type={type}
                        label={toKoreanType(type)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm">
              <h2 className="text-xl font-bold">실전 메모</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>{catalogEntry.notes}</p>
                {overlayEntry?.notes ? <p>{overlayEntry.notes}</p> : null}
                <p>
                  현재 확인된 타입은 {toKoreanTypes(catalogEntry.types).join(" / ")}이며, 기술은 총{" "}
                  {catalogEntry.moveCount}개 수집되어 있습니다.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {overlayEntry ? (
          <section className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-5 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold">샘플 세트</h2>
                <p className="mt-1 text-sm text-slate-500">
                  입문자도 바로 이해할 수 있도록 대표 운용 세트를 카드형으로 정리했습니다.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                확인된 세트 {overlayEntry.sets.length}개
              </span>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {overlayEntry.sets.map((set) => (
                <article
                  key={`${overlayEntry.id}-${set.label}`}
                  className="rounded-[1.45rem] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">{set.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{set.summary}</p>
                    </div>
                    <div className="flex size-14 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] shadow-sm">
                      <ItemThumb
                        slugOrName={set.item}
                        alt={toKoreanItemName(set.item)}
                        className="size-9"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-orange-50 p-3">
                      <div className="text-xs font-semibold tracking-[0.16em] text-orange-500">추천 도구</div>
                      <div className="mt-2 text-sm font-semibold text-orange-900">
                        {toKoreanItemName(set.item)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-sky-50 p-3">
                      <div className="text-xs font-semibold tracking-[0.16em] text-sky-500">추천 특성</div>
                      <div className="mt-2 text-sm font-semibold text-sky-900">
                        {toKoreanAbilityName(set.ability)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {set.moves.map((move) => (
                      <span
                        key={`${set.label}-${move}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {toKoreanMoveName(move)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/builder?party=${pokemon.slug}`}
                      className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
                    >
                      이 세트 감각으로 파티 짜기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {overlayEntry ? (
          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">같이 쓰기 좋은 조합</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {overlayEntry.goodWith.map((name) => (
                  <Link
                    key={name}
                    href={`/pokedex/${slugifyPokemonName(name)}`}
                    className="flex items-center justify-between rounded-[1.2rem] bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 transition hover:-translate-y-0.5 hover:bg-sky-100"
                  >
                    <span>{toKoreanPokemonName(name)}</span>
                    <span className="text-xs text-sky-700">상세 보기</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">주의할 상대</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {overlayEntry.checks.map((name) => (
                  <Link
                    key={name}
                    href={`/pokedex/${slugifyPokemonName(name)}`}
                    className="flex items-center justify-between rounded-[1.2rem] bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 transition hover:-translate-y-0.5 hover:bg-rose-100"
                  >
                    <span>{toKoreanPokemonName(name)}</span>
                    <span className="text-xs text-rose-700">상세 보기</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <PokemonDetailBrowser moves={moves} />
      </div>
    </DataPageShell>
  );
}

function slugifyPokemonName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function InsightPokemonList({
  title,
  tone,
  entries,
}: {
  title: string;
  tone: "blue" | "rose";
  entries: Array<{ id: string; name: string; iconUrl: string | null; reason: string }>;
}) {
  const toneClass = tone === "blue" ? "bg-blue-50 text-blue-900" : "bg-rose-50 text-rose-900";

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/pokedex/${entry.id}`}
            className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:-translate-y-0.5 ${toneClass}`}
          >
            <PokemonThumb
              slugOrName={entry.id}
              src={entry.iconUrl}
              alt={toKoreanPokemonName(entry.name, entry.id)}
              className="size-10"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-black">{toKoreanPokemonName(entry.name, entry.id)}</div>
              <div className="mt-1 line-clamp-2 text-xs font-semibold opacity-80">{entry.reason}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function InsightMoveList({
  title,
  tone,
  entries,
}: {
  title: string;
  tone: "emerald" | "amber";
  entries: Array<{ slug: string; name: string; type: string | null; power: number | null; reason: string }>;
}) {
  const toneClass = tone === "emerald" ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900";

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {entries.map((entry) => (
          <Link key={entry.slug} href={`/moves/${entry.slug}`} className={`rounded-2xl px-3 py-3 transition hover:-translate-y-0.5 ${toneClass}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-sm font-black">{toKoreanMoveName(entry.name, entry.slug)}</div>
              {entry.power ? <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-black">위력 {entry.power}</span> : null}
            </div>
            <div className="mt-1 text-xs font-semibold opacity-80">{entry.reason}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function sameStats(
  left: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
  right: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
) {
  return (
    left.hp === right.hp &&
    left.atk === right.atk &&
    left.def === right.def &&
    left.spa === right.spa &&
    left.spd === right.spd &&
    left.spe === right.spe
  );
}

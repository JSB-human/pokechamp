import Link from "next/link";
import { notFound } from "next/navigation";
import { DataPageShell } from "@/components/data-page-shell";
import { PokemonThumb } from "@/components/media";
import { getCollectedAbilityBySlug, getCollectedPokemon } from "@/lib/collected-data";
import { toKoreanAbilityDescription, toKoreanAbilityName, toKoreanPokemonName } from "@/lib/korean";

export default async function AbilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ability = getCollectedAbilityBySlug(slug);

  if (!ability) {
    notFound();
  }

  const pokemon = getCollectedPokemon();

  return (
    <DataPageShell
      eyebrow="특성 상세"
      title={toKoreanAbilityName(ability.name, ability.slug)}
      description="특성 설명과 함께 어떤 포켓몬이 이 특성을 사용하는지 바로 이어서 살펴볼 수 있습니다."
      stats={[
        { label: "영문명", value: ability.name },
        { label: "연결 포켓몬", value: `${ability.pokemon.length}` },
        { label: "활용 위치", value: "세트 이해" },
        { label: "상세 확인", value: "대표 사용자" },
      ]}
    >
      <div className="space-y-6">
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{toKoreanAbilityName(ability.name, ability.slug)}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {toKoreanAbilityDescription(ability.description, ability.slug, ability.name)}
              </p>
            </div>
            <Link
              href="/abilities"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
            >
              특성 도감으로 돌아가기
            </Link>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f5fffb_100%)] p-5 shadow-sm">
          <h2 className="text-xl font-bold">이 특성을 가진 포켓몬</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ability.pokemon.map((name) => {
              const entry = pokemon.find((candidate) => candidate.name === name);
              const slugValue = entry?.slug ?? slugifyPokemonName(name);
              return (
                <Link
                  key={name}
                  href={`/pokedex/${slugValue}`}
                  className="rounded-[1.3rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-14 items-center justify-center rounded-[1rem] bg-slate-50">
                      <PokemonThumb
                        slugOrName={slugValue}
                        src={entry?.iconUrl ?? null}
                        alt={toKoreanPokemonName(name, slugValue)}
                        className="size-10"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-950">
                        {toKoreanPokemonName(name, slugValue)}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">{name}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
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

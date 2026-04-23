import Link from "next/link";
import { notFound } from "next/navigation";
import { DataPageShell } from "@/components/data-page-shell";
import { ItemThumb, PokemonThumb } from "@/components/media";
import { getCollectedItemBySlug } from "@/lib/collected-data";
import {
  toKoreanItemCategory,
  toKoreanItemDescription,
  toKoreanItemName,
  toKoreanPokemonName,
  toKoreanUnlock,
} from "@/lib/korean";
import { getCatalogPokemon } from "@/lib/pokemon-catalog";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getCollectedItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const users = getCatalogPokemon()
    .filter((entry) => normalizeItemSlug(entry.suggestedItem) === slug)
    .slice(0, 8);

  return (
    <DataPageShell
      eyebrow="도구 상세"
      title={toKoreanItemName(item.name, item.slug)}
      description="도구 효과와 획득 정보, 추천 세트에서 함께 쓰기 좋은 포켓몬을 한눈에 보여 줍니다."
      stats={[
        { label: "분류", value: toKoreanItemCategory(item.category, item.slug, item.name) },
        { label: "획득", value: toKoreanUnlock(item.unlock, item.slug, item.name) },
        { label: "사용 가능", value: item.availableInChampions ? "예" : "아니오" },
        { label: "대표 사용자", value: `${users.length}` },
      ]}
    >
      <div className="space-y-6">
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] shadow-sm">
                <ItemThumb
                  slugOrName={item.slug}
                  src={item.iconUrl}
                  alt={toKoreanItemName(item.name, item.slug)}
                  className="size-12"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">{toKoreanItemName(item.name, item.slug)}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {toKoreanItemDescription(item.description, item.slug, item.name)}
                </p>
              </div>
            </div>
            <Link
              href="/items"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
            >
              도구 도감으로 돌아가기
            </Link>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf2_100%)] p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">대표 사용자</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            전체 포켓몬 카탈로그의 추천 도구 데이터를 기준으로 연결했습니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {users.length > 0 ? (
              users.map((pokemon) => (
                <Link
                  key={pokemon.id}
                  href={`/pokedex/${pokemon.id}`}
                  className="rounded-[1.3rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-14 items-center justify-center rounded-[1rem] bg-slate-50">
                      <PokemonThumb
                        slugOrName={pokemon.id}
                        src={pokemon.iconUrl}
                        alt={toKoreanPokemonName(pokemon.name, pokemon.id)}
                        className="size-10"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-black text-slate-950">
                        {toKoreanPokemonName(pokemon.name, pokemon.id)}
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold text-slate-500">
                        {pokemon.setLabel ?? "추천 운용 확인"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500">
                현재 연결된 대표 사용자가 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </DataPageShell>
  );
}

function normalizeItemSlug(value: string | null) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";
}

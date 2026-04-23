import Link from "next/link";
import { notFound } from "next/navigation";
import { DataPageShell } from "@/components/data-page-shell";
import { PokemonThumb, TypeBadge } from "@/components/media";
import {
  getCollectedMoveBySlug,
  getCollectedPokemon,
  getCollectedPokemonLearnsets,
} from "@/lib/collected-data";
import {
  toKoreanDamageClass,
  toKoreanMoveDescription,
  toKoreanMoveName,
  toKoreanPokemonName,
  toKoreanType,
} from "@/lib/korean";

export default async function MoveDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const move = getCollectedMoveBySlug(slug);

  if (!move) {
    notFound();
  }

  const pokemon = getCollectedPokemon();
  const users = getCollectedPokemonLearnsets()
    .filter((entry) => entry.moves.some((candidate) => candidate.slug === slug))
    .slice(0, 12)
    .map((entry) => ({
      slug: entry.slug,
      name: pokemon.find((candidate) => candidate.slug === entry.slug)?.name ?? entry.slug,
      iconUrl: pokemon.find((candidate) => candidate.slug === entry.slug)?.iconUrl ?? null,
    }));

  return (
    <DataPageShell
      eyebrow="기술 상세"
      title={toKoreanMoveName(move.name, move.slug)}
      description="기술의 타입, 분류, 위력, 명중, PP와 함께 실제로 배울 수 있는 포켓몬까지 묶어 보여 줍니다."
      stats={[
        { label: "타입", value: toKoreanType(move.type ?? "unknown") },
        { label: "분류", value: toKoreanDamageClass(move.damageClass) },
        { label: "위력", value: `${move.power ?? "-"}` },
        { label: "명중", value: `${move.accuracy ?? "-"}` },
      ]}
    >
      <div className="space-y-6">
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{toKoreanMoveName(move.name, move.slug)}</h2>
                <TypeBadge
                  type={move.type ?? "unknown"}
                  label={toKoreanType(move.type ?? "unknown")}
                  iconUrl={move.typeIconUrl}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {toKoreanMoveDescription(move.description, move.slug, move.name)}
              </p>
            </div>
            <Link
              href="/moves"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
            >
              기술 도감으로 돌아가기
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">위력</div>
              <div className="mt-2 text-2xl font-bold text-slate-950">{move.power ?? "-"}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">명중</div>
              <div className="mt-2 text-2xl font-bold text-slate-950">{move.accuracy ?? "-"}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">PP</div>
              <div className="mt-2 text-2xl font-bold text-slate-950">{move.pp ?? "-"}</div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-5 shadow-sm">
          <h2 className="text-xl font-bold">이 기술을 배울 수 있는 포켓몬</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((entry) => (
              <Link
                key={entry.slug}
                href={`/pokedex/${entry.slug}`}
                className="rounded-[1.3rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-[1rem] bg-slate-50">
                    <PokemonThumb
                      slugOrName={entry.slug}
                      src={entry.iconUrl}
                      alt={toKoreanPokemonName(entry.name, entry.slug)}
                      className="size-10"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">
                      {toKoreanPokemonName(entry.name, entry.slug)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{entry.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DataPageShell>
  );
}

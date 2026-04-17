import Link from "next/link";
import { notFound } from "next/navigation";
import { DataPageShell } from "@/components/data-page-shell";
import { PokemonThumb, TypeBadge } from "@/components/media";
import { PokemonDetailBrowser } from "@/components/pokemon-detail-browser";
import {
  getCollectedPokemonBySlug,
  getCollectedPokemonLearnset,
} from "@/lib/collected-data";
import {
  toKoreanDamageClass,
  toKoreanMoveDescription,
  toKoreanMoveName,
  toKoreanPokemonName,
  toKoreanStat,
  toKoreanType,
} from "@/lib/korean";

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pokemon = getCollectedPokemonBySlug(slug);
  const learnset = getCollectedPokemonLearnset(slug);

  if (!pokemon) {
    notFound();
  }

  const moves = (learnset?.moves ?? []).map((move) => ({
    slug: move.slug,
    displayName: toKoreanMoveName(move.name, move.slug),
    displayType: toKoreanType(move.type ?? "unknown"),
    rawType: move.type ?? "unknown",
    typeIconUrl: move.typeIconUrl,
    displayDamageClass: toKoreanDamageClass(move.damageClass),
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    description: toKoreanMoveDescription(move.description, move.slug, move.name),
  }));

  return (
    <DataPageShell
      eyebrow="포켓몬 상세"
      title={toKoreanPokemonName(pokemon.name, pokemon.slug)}
      description="포켓몬 챔피언스에서 확인된 아이콘과 타입 정보를 그대로 사용하고, 해당 포켓몬이 배울 수 있는 기술 목록을 함께 제공합니다."
      stats={[
        { label: "전국도감 번호", value: `${pokemon.nationalNumber}` },
        { label: "배울 수 있는 기술", value: `${learnset?.moveCount ?? 0}` },
        { label: "사용률", value: pokemon.usage != null ? `${pokemon.usage.toFixed(1)}%` : "-" },
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
                No. {pokemon.nationalNumber}
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
            </div>
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
                href="/builder"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                파티 빌더 열기
              </Link>
            </div>
          </div>
        </div>

        <PokemonDetailBrowser moves={moves} />
      </div>
    </DataPageShell>
  );
}

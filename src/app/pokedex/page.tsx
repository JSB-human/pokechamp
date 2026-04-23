import { DataPageShell } from "@/components/data-page-shell";
import { PokedexBrowser } from "@/components/pokedex-browser";
import {
  getCollectedPokemon,
  getCollectedPokemonLearnsets,
} from "@/lib/collected-data";
import { toKoreanPokemonName, toKoreanTypes } from "@/lib/korean";
import { isMegaForm } from "@/lib/pokemon-catalog";

export default function PokedexPage() {
  const allPokemon = getCollectedPokemon();
  const learnsets = getCollectedPokemonLearnsets();
  const learnsetBySlug = new Map(learnsets.map((entry) => [entry.slug, entry.moveCount]));
  const pokemon = allPokemon.filter((entry) => entry.regulationSets.length > 0 && !isMegaForm(entry.slug, entry.name)).sort((left, right) => {
    if (left.nationalNumber !== right.nationalNumber) {
      return left.nationalNumber - right.nationalNumber;
    }

    return left.name.localeCompare(right.name);
  });

  const localizedPokemon = pokemon.map((entry) => ({
    slug: entry.slug,
    nationalNumber: entry.nationalNumber,
    displayName: toKoreanPokemonName(entry.name, entry.slug),
    englishName: entry.name,
    iconUrl: entry.iconUrl,
    displayTypes: toKoreanTypes(entry.types),
    rawTypes: entry.types,
    typeDetails: entry.typeDetails,
    usage: entry.usage,
    baseStats: entry.baseStats,
    moveCount: learnsetBySlug.get(entry.slug) ?? 0,
  }));

  return (
    <DataPageShell
      eyebrow="포켓몬 도감"
      title="포켓몬 도감"
      description="챔피언스에서 사용할 수 있는 포켓몬을 이미지, 타입, 기본 스탯, 배울 수 있는 기술 수까지 한 번에 확인할 수 있는 도감입니다."
      stats={[
        { label: "수집된 포켓몬", value: `${pokemon.length}` },
        { label: "도감 엔트리", value: `${pokemon.length}` },
        { label: "기술 학습 정보", value: `${learnsets.filter((entry) => entry.moveCount > 0).length}` },
        { label: "상세 보기", value: "포켓몬별 기술 목록" },
      ]}
    >
      <PokedexBrowser pokemon={localizedPokemon} />
    </DataPageShell>
  );
}

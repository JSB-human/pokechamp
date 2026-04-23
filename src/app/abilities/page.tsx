import { AbilitiesBrowser } from "@/components/abilities-browser";
import { DataPageShell } from "@/components/data-page-shell";
import { getCollectedAbilities, getCollectedPokemon } from "@/lib/collected-data";
import { toKoreanAbilityDescription, toKoreanAbilityName, toKoreanPokemonName } from "@/lib/korean";

export default function AbilitiesPage() {
  const abilities = getCollectedAbilities();
  const pokemon = getCollectedPokemon();
  const pokemonIconByName = new Map(pokemon.map((entry) => [entry.name, entry.iconUrl]));

  const localizedAbilities = abilities.map((ability) => ({
    slug: ability.slug,
    displayName: toKoreanAbilityName(ability.name, ability.slug),
    englishName: ability.name,
    description: toKoreanAbilityDescription(ability.description, ability.slug, ability.name),
    pokemon: ability.pokemon.map((name) => ({
      korean: toKoreanPokemonName(name),
      english: name,
      iconUrl: pokemonIconByName.get(name) ?? null,
    })),
  }));

  return (
    <DataPageShell
      eyebrow="특성 도감"
      title="특성 도감"
      description="특성 효과와 함께 주로 사용하는 포켓몬까지 연결해 두어 세트와 운영 흐름을 빠르게 이해할 수 있습니다."
      stats={[
        { label: "수집된 특성", value: `${abilities.length}` },
        { label: "특성 엔트리", value: `${abilities.length}` },
        { label: "같이 보기", value: "설명, 대표 사용자" },
        { label: "활용 위치", value: "운영 이해, 세트 설계" },
      ]}
    >
      <AbilitiesBrowser abilities={localizedAbilities} />
    </DataPageShell>
  );
}

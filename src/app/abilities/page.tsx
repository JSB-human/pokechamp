import { AbilitiesBrowser } from "@/components/abilities-browser";
import { DataPageShell } from "@/components/data-page-shell";
import { getCollectedAbilities, getOpggOverview } from "@/lib/collected-data";
import { toKoreanAbilityDescription, toKoreanAbilityName, toKoreanPokemonName } from "@/lib/korean";

export default function AbilitiesPage() {
  const abilities = getCollectedAbilities();
  const overview = getOpggOverview();
  const localizedAbilities = abilities.map((ability) => ({
    slug: ability.slug,
    displayName: toKoreanAbilityName(ability.name, ability.slug),
    englishName: ability.name,
    description: toKoreanAbilityDescription(ability.description, ability.slug, ability.name),
    pokemon: ability.pokemon.map((name) => ({
      korean: toKoreanPokemonName(name),
      english: name,
    })),
  }));

  return (
    <DataPageShell
      eyebrow="특성 도감"
      title="특성 도감"
      description="특성 효과와 대표 사용자 포켓몬을 같이 보여줘서 바로 이해할 수 있게 만든 페이지입니다."
      stats={[
        { label: "수집된 특성", value: `${abilities.length}` },
        { label: "OP.GG 집계 수", value: `${overview.abilityCount ?? "-"}` },
        { label: "같이 보기", value: "설명 · 대표 사용자" },
        { label: "활용도", value: "운영 이해 · 팀 설계" },
      ]}
    >
      <AbilitiesBrowser abilities={localizedAbilities} />
    </DataPageShell>
  );
}

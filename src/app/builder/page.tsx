import { BuilderBoard } from "@/components/builder-board";
import { DataPageShell } from "@/components/data-page-shell";
import { getCatalogPokemon } from "@/lib/pokemon-catalog";

export default function BuilderPage() {
  const catalog = getCatalogPokemon();

  return (
    <DataPageShell
      eyebrow="파티 빌더"
      title="파티 빌더"
      description="6마리 조합을 채우면 겹치는 약점, 역할 부족, 추천 포켓몬까지 한 번에 볼 수 있는 파티 빌더입니다."
      stats={[
        { label: "최대 슬롯", value: "6" },
        { label: "분석 내용", value: "약점, 역할, 추천" },
        { label: "입문 난이도", value: "쉬움" },
        { label: "추천 흐름", value: "샘플 → 빌더" },
      ]}
    >
      <BuilderBoard catalog={catalog} />
    </DataPageShell>
  );
}

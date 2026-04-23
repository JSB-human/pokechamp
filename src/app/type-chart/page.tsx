import { DataPageShell } from "@/components/data-page-shell";
import { TypeChartBoard } from "@/components/type-chart-board";
import { getCollectedPokemon } from "@/lib/collected-data";
import { ALL_TYPES } from "@/lib/type-chart";
import type { PokemonType } from "@/types/pokemon";

export default function TypeChartPage() {
  const pokemon = getCollectedPokemon();
  const iconByType = new Map<string, string | null>();

  for (const entry of pokemon) {
    for (const type of entry.typeDetails) {
      if (!iconByType.has(type.name)) {
        iconByType.set(type.name, type.iconUrl);
      }
    }
  }

  const typeMeta = ALL_TYPES.map((type) => ({
    type,
    iconUrl: iconByType.get(type) ?? null,
  })) satisfies Array<{ type: PokemonType; iconUrl: string | null }>;

  return (
    <DataPageShell
      eyebrow="상성표"
      title="타입 상성표"
      description="공격과 방어 상성을 초보자도 바로 읽을 수 있게 풀어 놓은 챔피언스용 타입 상성표입니다."
      stats={[
        { label: "타입 수", value: `${ALL_TYPES.length}` },
        { label: "빠른 확인", value: "공격, 방어, 복합 타입" },
        { label: "전체 표", value: "18 x 18" },
        { label: "활용 위치", value: "도감, 빌더, 계산기" },
      ]}
    >
      <TypeChartBoard typeMeta={typeMeta} />
    </DataPageShell>
  );
}

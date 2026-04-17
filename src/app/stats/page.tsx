import { DataPageShell } from "@/components/data-page-shell";
import { StatsOverview } from "@/components/stats-overview";
import { pokemonData } from "@/data/champions-data";
import { getOpggOverview } from "@/lib/collected-data";

export default function StatsPage() {
  const overview = getOpggOverview();

  return (
    <DataPageShell
      eyebrow="메타 통계"
      title="메타 통계"
      description="지금 자주 보이는 포켓몬, 도구, 역할 분포를 부담 없이 훑어볼 수 있는 요약 화면입니다."
      stats={[
        { label: "상위 메타 샘플", value: `${pokemonData.length}` },
        { label: "OP.GG 포켓몬", value: `${overview.pokemonCount ?? "-"}` },
        { label: "OP.GG 기술", value: `${overview.moveCount ?? "-"}` },
        { label: "목적", value: "빠른 메타 파악" },
      ]}
    >
      <StatsOverview />
    </DataPageShell>
  );
}

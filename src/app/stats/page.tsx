import { DataPageShell } from "@/components/data-page-shell";
import { StatsOverview } from "@/components/stats-overview";
import { getCatalogPokemon } from "@/lib/pokemon-catalog";

export default function StatsPage() {
  const catalog = getCatalogPokemon();

  return (
    <DataPageShell
      eyebrow="메타 통계"
      title="메타 통계"
      description="지금 자주 보이는 포켓몬, 도구, 역할 분포를 부담 없이 빠르게 훑어볼 수 있는 요약 화면입니다."
      stats={[
        { label: "분석 포켓몬", value: `${catalog.length}` },
        { label: "분석 대상", value: `${catalog.length}` },
        { label: "추천 기반", value: "타입·역할·기술" },
        { label: "목적", value: "빠른 메타 파악" },
      ]}
    >
      <StatsOverview catalog={catalog} />
    </DataPageShell>
  );
}

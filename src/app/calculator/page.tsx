import { CalculatorLab } from "@/components/calculator-lab";
import { DataPageShell } from "@/components/data-page-shell";
import { getCatalogPokemon } from "@/lib/pokemon-catalog";

export default function CalculatorPage() {
  const catalog = getCatalogPokemon();

  return (
    <DataPageShell
      eyebrow="계산기"
      title="계산기"
      description="데미지, 스피드, 결정력, 내구를 나눠서 초보자도 쉽게 볼 수 있도록 만든 실전 계산기입니다."
      stats={[
        { label: "계산 탭", value: "4개" },
        { label: "기본 레벨", value: "50" },
        { label: "성격 반영", value: "실전 계산" },
        { label: "선택 포켓몬", value: `${catalog.length}` },
      ]}
    >
      <CalculatorLab catalog={catalog} />
    </DataPageShell>
  );
}

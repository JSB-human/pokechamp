import { CalculatorLab } from "@/components/calculator-lab";
import { DataPageShell } from "@/components/data-page-shell";

export default function CalculatorPage() {
  return (
    <DataPageShell
      eyebrow="계산기"
      title="계산기"
      description="데미지, 스피드, 결정력, 내구력을 분리해서 보여주는 쉬운 계산기 실험실입니다."
      stats={[
        { label: "계산 탭", value: "4개" },
        { label: "기본 레벨", value: "50" },
        { label: "성격 반영", value: "스마트누오 기준" },
        { label: "현재 상태", value: "첫 버전" },
      ]}
    >
      <CalculatorLab />
    </DataPageShell>
  );
}

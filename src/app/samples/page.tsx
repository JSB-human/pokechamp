import { DataPageShell } from "@/components/data-page-shell";
import { SamplesBrowser } from "@/components/samples-browser";
import { teamPresets } from "@/data/champions-data";

export default function SamplesPage() {
  return (
    <DataPageShell
      eyebrow="샘플 파티"
      title="샘플 파티"
      description="처음 시작하는 분도 바로 참고할 수 있게 메타형 조합을 쉬운 설명과 함께 정리했습니다."
      stats={[
        { label: "샘플 수", value: `${teamPresets.length}` },
        { label: "중심 목적", value: "빠른 이해" },
        { label: "추천 사용", value: "입문 · 테스트" },
        { label: "연결 메뉴", value: "파티 빌더" },
      ]}
    >
      <SamplesBrowser />
    </DataPageShell>
  );
}

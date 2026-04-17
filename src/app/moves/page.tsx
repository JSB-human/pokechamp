import { DataPageShell } from "@/components/data-page-shell";
import { MovesBrowser } from "@/components/moves-browser";
import { getCollectedMoves, getOpggOverview } from "@/lib/collected-data";
import {
  toKoreanDamageClass,
  toKoreanMoveDescription,
  toKoreanMoveName,
  toKoreanType,
} from "@/lib/korean";

export default function MovesPage() {
  const moves = getCollectedMoves();
  const overview = getOpggOverview();
  const localizedMoves = moves.map((move) => ({
    slug: move.slug,
    displayName: toKoreanMoveName(move.name, move.slug),
    englishName: move.name,
    displayType: toKoreanType(move.type ?? "unknown"),
    rawType: move.type ?? "unknown",
    typeIconUrl: move.typeIconUrl,
    displayDamageClass: toKoreanDamageClass(move.damageClass),
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    description: toKoreanMoveDescription(move.description, move.slug, move.name),
  }));

  return (
    <DataPageShell
      eyebrow="기술 도감"
      title="기술 도감"
      description="기술 이름, 타입, 분류, 위력, 명중, PP를 한 번에 확인할 수 있도록 정리한 챔피언스 기술 도감입니다."
      stats={[
        { label: "수집된 기술", value: `${moves.length}` },
        { label: "OP.GG 집계 수", value: `${overview.moveCount ?? "-"}` },
        { label: "빠른 필터", value: "이름, 타입, 분류" },
        { label: "활용 위치", value: "도감, 빌더, 계산기" },
      ]}
    >
      <MovesBrowser moves={localizedMoves} />
    </DataPageShell>
  );
}

import { DataPageShell } from "@/components/data-page-shell";
import { ItemsBrowser } from "@/components/items-browser";
import { getCollectedItems } from "@/lib/collected-data";
import {
  toKoreanItemCategory,
  toKoreanItemDescription,
  toKoreanItemName,
  toKoreanUnlock,
} from "@/lib/korean";

export default function ItemsPage() {
  const items = getCollectedItems();
  const localizedItems = items.map((item) => ({
    slug: item.slug,
    displayName: toKoreanItemName(item.name, item.slug),
    englishName: item.name,
    iconUrl: item.iconUrl,
    displayCategory: toKoreanItemCategory(item.category, item.slug, item.name),
    description: toKoreanItemDescription(item.description, item.slug, item.name),
    unlockText: toKoreanUnlock(item.unlock, item.slug, item.name),
    availableInChampions: item.availableInChampions,
  }));

  return (
    <DataPageShell
      eyebrow="도구 도감"
      title="도구 도감"
      description="전투 아이템과 메가스톤, 획득 정보까지 한눈에 확인할 수 있도록 챔피언스 도구 데이터를 정리했습니다."
      stats={[
        { label: "수집된 도구", value: `${items.length}` },
        { label: "주요 분류", value: "전투, 메가스톤, 기타" },
        { label: "확인 가능", value: "효과, 획득처" },
        { label: "추천 활용", value: "세트 구성 활용" },
      ]}
    >
      <ItemsBrowser items={localizedItems} />
    </DataPageShell>
  );
}

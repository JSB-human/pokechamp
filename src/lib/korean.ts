import koLocalization from "../../data/normalized/ko-localization.json";
import {
  smartnuoAbilityBySlug,
  smartnuoItemBySlug,
  smartnuoModifierAbilities,
  smartnuoModifierItems,
  smartnuoMoveBySlug,
  smartnuoNatureBySlug,
  smartnuoTypeByEnglish,
} from "@/lib/smartnuo";

const typeMap: Record<string, string> = {
  ...smartnuoTypeByEnglish,
  Stellar: "스텔라",
  unknown: "미상",
};

const statMap: Record<string, string> = {
  hp: "HP",
  atk: "공격",
  def: "방어",
  spa: "특수공격",
  spd: "특수방어",
  spe: "스피드",
};

const roleMap: Record<string, string> = {
  lead: "리드",
  "speed-control": "스피드 조절",
  pivot: "교체 운영",
  support: "서포트",
  rain: "비 파티",
  sun: "쾌청 파티",
  sweeper: "마무리 에이스",
  breaker: "벽 파괴",
  priority: "선공기 보유",
  bulky: "내구형",
  "trick-room": "트릭룸",
  "special-attacker": "특수 딜러",
  "physical-attacker": "물리 딜러",
};

const damageClassMap: Record<string, string> = {
  physical: "물리",
  special: "특수",
  status: "변화",
};

const unlockMap: Record<string, string> = {
  "shop-2000-vp": "상점 2000 VP",
  "shop-1000-vp": "상점 1000 VP",
  "shop-500-vp": "상점 500 VP",
  "shop-300-vp": "상점 300 VP",
};

const itemCategoryMap: Record<string, string> = {
  "mega-evolution": "메가스톤",
  battle: "배틀 아이템",
  held: "지닌도구",
  berries: "열매",
};

type KoMapEntry = {
  name?: string;
  description?: string;
  category?: string;
  unlock?: string;
};

type KoLocalization = {
  pokemonBySlug: Record<string, KoMapEntry>;
  moveBySlug: Record<string, KoMapEntry>;
  itemBySlug: Record<string, KoMapEntry>;
  abilityBySlug: Record<string, KoMapEntry>;
};

const localization = koLocalization as KoLocalization;

export function toKoreanType(type: string) {
  return typeMap[type] ?? type;
}

export function toKoreanTypes(types: string[]) {
  return types.map(toKoreanType);
}

export function toKoreanStat(stat: string) {
  return statMap[stat] ?? stat.toUpperCase();
}

export function toKoreanRole(role: string) {
  return roleMap[role] ?? role;
}

export function toKoreanDamageClass(value: string | null | undefined) {
  if (!value) {
    return "분류 미상";
  }

  return damageClassMap[value] ?? value;
}

export function toKoreanPokemonName(name: string, slug?: string) {
  const normalizedSlug = slug ?? toSlug(name);
  const entry =
    localization.pokemonBySlug[normalizedSlug] ?? findByEnglishName(localization.pokemonBySlug, name);

  if (entry?.name) {
    return entry.name;
  }

  return applyPokemonFormFallback(name, normalizedSlug);
}

export function toKoreanMoveName(name: string, slug?: string) {
  const smartnuoName = slug ? smartnuoMoveBySlug[slug] : smartnuoMoveBySlug[toSlug(name)];
  if (smartnuoName) {
    return smartnuoName;
  }

  const entry =
    (slug ? localization.moveBySlug[slug] : undefined) ?? findBySlugGuess(localization.moveBySlug, name);
  return entry?.name ?? name;
}

export function toKoreanMoveDescription(description: string, slug?: string, name?: string) {
  const entry =
    (slug ? localization.moveBySlug[slug] : undefined) ??
    (name ? findBySlugGuess(localization.moveBySlug, name) : undefined);
  return entry?.description ?? description;
}

export function toKoreanItemName(name: string, slug?: string) {
  const targetSlug = slug ?? toSlug(name);
  const smartnuoName = smartnuoItemBySlug[targetSlug] ?? smartnuoModifierItems[targetSlug]?.nameKo;
  if (smartnuoName) {
    return smartnuoName;
  }

  const entry = (slug ? localization.itemBySlug[slug] : undefined) ?? findBySlugGuess(localization.itemBySlug, name);
  return entry?.name ?? name;
}

export function toKoreanItemDescription(description: string, slug?: string, name?: string) {
  const entry =
    (slug ? localization.itemBySlug[slug] : undefined) ??
    (name ? findBySlugGuess(localization.itemBySlug, name) : undefined);
  return entry?.description ?? description;
}

export function toKoreanItemCategory(category: string | null | undefined, slug?: string, name?: string) {
  const entry =
    (slug ? localization.itemBySlug[slug] : undefined) ??
    (name ? findBySlugGuess(localization.itemBySlug, name) : undefined);

  if (entry?.category) {
    return entry.category;
  }

  if (!category) {
    return "기타";
  }

  return itemCategoryMap[category] ?? category;
}

export function toKoreanUnlock(unlock: string | null | undefined, slug?: string, name?: string) {
  const entry =
    (slug ? localization.itemBySlug[slug] : undefined) ??
    (name ? findBySlugGuess(localization.itemBySlug, name) : undefined);

  if (entry?.unlock) {
    return entry.unlock;
  }

  if (!unlock) {
    return "정보 없음";
  }

  return unlockMap[unlock] ?? unlock;
}

export function toKoreanAbilityName(name: string, slug?: string) {
  const targetSlug = slug ?? toSlug(name);
  const smartnuoName = smartnuoAbilityBySlug[targetSlug] ?? smartnuoModifierAbilities[targetSlug]?.nameKo;
  if (smartnuoName) {
    return smartnuoName;
  }

  const entry =
    (slug ? localization.abilityBySlug[slug] : undefined) ?? findBySlugGuess(localization.abilityBySlug, name);
  return entry?.name ?? name;
}

export function toKoreanAbilityDescription(description: string, slug?: string, name?: string) {
  const entry =
    (slug ? localization.abilityBySlug[slug] : undefined) ??
    (name ? findBySlugGuess(localization.abilityBySlug, name) : undefined);
  return entry?.description ?? description;
}

export function toKoreanNature(slug: string) {
  return smartnuoNatureBySlug[slug] ?? slug;
}

function findBySlugGuess(source: Record<string, KoMapEntry>, englishName: string) {
  return source[toSlug(englishName)];
}

function findByEnglishName(source: Record<string, KoMapEntry>, englishName: string) {
  return source[toSlug(englishName)];
}

function applyPokemonFormFallback(name: string, slug: string) {
  if (slug.endsWith("-mega")) {
    return `메가 ${toKoreanPokemonName(name.replace(/^Mega\s+/i, ""), slug.replace(/-mega$/, ""))}`;
  }

  if (slug.endsWith("-hisui")) {
    return `히스이 ${toKoreanPokemonName(name.replace(/^Hisuian\s+/i, ""), slug.replace(/-hisui$/, ""))}`;
  }

  if (slug.endsWith("-alola")) {
    return `알로라 ${toKoreanPokemonName(name.replace(/^Alolan\s+/i, ""), slug.replace(/-alola$/, ""))}`;
  }

  if (slug.endsWith("-galar")) {
    return `가라르 ${toKoreanPokemonName(name.replace(/^Galarian\s+/i, ""), slug.replace(/-galar$/, ""))}`;
  }

  if (slug.endsWith("-paldea")) {
    return `팔데아 ${toKoreanPokemonName(name.replace(/^Paldean\s+/i, ""), slug.replace(/-paldea$/, ""))}`;
  }

  if (slug.endsWith("-bloodmoon")) {
    return `${toKoreanPokemonName(name.replace(/\s*Bloodmoon$/i, ""), slug.replace(/-bloodmoon$/, ""))} 블러드문`;
  }

  return name;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "-");
}

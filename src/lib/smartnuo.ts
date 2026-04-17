import abilityKoMap from "../../data/vendor/smartnuo/abilityKoMap.json";
import itemKoMap from "../../data/vendor/smartnuo/itemKoMap.json";
import modifiers from "../../data/vendor/smartnuo/modifiers.json";
import moveKoMap from "../../data/vendor/smartnuo/moveKoMap.json";
import natureKoMap from "../../data/vendor/smartnuo/natureKoMap.json";
import natureStatMul from "../../data/vendor/smartnuo/natureStatMul.json";
import typeKoMap from "../../data/vendor/smartnuo/typeKoMap.json";

function invertMap(source: Record<string, string>) {
  return Object.fromEntries(Object.entries(source).map(([ko, slug]) => [slug, ko]));
}

export const smartnuoAbilityBySlug = invertMap(
  (abilityKoMap as { byKo: Record<string, string> }).byKo,
);

export const smartnuoItemBySlug = invertMap(
  (itemKoMap as { byKo: Record<string, string> }).byKo,
);

export const smartnuoMoveBySlug = invertMap(
  (moveKoMap as { byKo: Record<string, string> }).byKo,
);

export const smartnuoTypeByEnglish = Object.fromEntries(
  Object.entries((typeKoMap as { byKo: Record<string, string> }).byKo).map(([ko, en]) => [en, ko]),
);

export const smartnuoNatureBySlug = Object.fromEntries(
  Object.entries((natureKoMap as { koToSlug: Record<string, string> }).koToSlug).map(([ko, slug]) => [
    slug,
    ko,
  ]),
);

export const smartnuoNatureStats =
  (natureStatMul as {
    bySlug?: Record<string, { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }>;
  }).bySlug ?? {};

export const smartnuoModifierItems = (modifiers as { items?: Record<string, { nameKo?: string }> }).items ?? {};
export const smartnuoModifierAbilities =
  (modifiers as { abilities?: Record<string, { nameKo?: string }> }).abilities ?? {};

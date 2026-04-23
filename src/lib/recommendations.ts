import type { CatalogPokemon, PartyAnalysis, PokemonType, RoleTag } from "@/types/pokemon";
import { toKoreanPokemonName, toKoreanRole, toKoreanTypes } from "@/lib/korean";

const ROLE_PRIORITY: RoleTag[] = [
  "speed-control",
  "pivot",
  "support",
  "rain",
  "sun",
  "trick-room",
  "priority",
  "breaker",
];

export function getPokemonByName(name: string, catalog: CatalogPokemon[]) {
  return catalog.find((pokemon) => pokemon.name === name);
}

export function analyzeParty(memberNames: string[], catalog: CatalogPokemon[]): PartyAnalysis {
  const selected = memberNames
    .map((name) => getPokemonByName(name, catalog))
    .filter((pokemon): pokemon is CatalogPokemon => Boolean(pokemon));

  const roleCounts = new Map<RoleTag, number>();
  const weaknessCounts = new Map<PokemonType, number>();
  const itemCounts = new Map<string, number>();

  for (const pokemon of selected) {
    for (const role of pokemon.roles) {
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
    }

    for (const weakness of pokemon.weaknesses) {
      weaknessCounts.set(weakness, (weaknessCounts.get(weakness) ?? 0) + 1);
    }

    if (pokemon.suggestedItem) {
      itemCounts.set(pokemon.suggestedItem, (itemCounts.get(pokemon.suggestedItem) ?? 0) + 1);
    }
  }

  const roleCoverage = ROLE_PRIORITY.filter((role) => roleCounts.has(role));
  const sharedWeaknesses = [...weaknessCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  const duplicateItems = [...itemCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([item, count]) => ({ item, count }));

  const missingRoles = ROLE_PRIORITY.filter((role) => !roleCounts.has(role));
  const selectedNames = new Set(selected.map((pokemon) => pokemon.name));
  const selectedRoleSet = new Set(selected.flatMap((pokemon) => pokemon.roles));
  const topThreats = buildTopThreats(catalog);

  const suggestions = catalog
    .filter((candidate) => !selectedNames.has(candidate.name))
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      const weaknessFixes = sharedWeaknesses
        .filter(({ type }) => candidate.resists.includes(type))
        .map(({ type }) => type);
      if (weaknessFixes.length > 0) {
        score += weaknessFixes.length * 14;
        reasons.push(
          `겹치는 약점인 ${toKoreanTypes(weaknessFixes).join(", ")} 상성을 받아줄 수 있습니다.`,
        );
      }

      const fillsRoles = candidate.roles.filter((role) => missingRoles.includes(role));
      if (fillsRoles.length > 0) {
        score += fillsRoles.length * 12;
        reasons.push(
          `부족한 역할인 ${fillsRoles.map((role) => toKoreanRole(role)).join(", ")}를 채워 줄 수 있습니다.`,
        );
      }

      const matchingCoreRoles = candidate.roles.filter((role) => selectedRoleSet.has(role));
      if (matchingCoreRoles.some((role) => role === "rain" || role === "sun" || role === "trick-room")) {
        score += 10;
        reasons.push(`현재 파티의 핵심 운영 방향과 잘 맞는 포켓몬입니다.`);
      }

      if (candidate.roles.includes("priority") && !selectedRoleSet.has("priority")) {
        score += 8;
        reasons.push(`선공 기술 축을 보강하기 좋습니다.`);
      }

      if (candidate.roles.includes("pivot") && !selectedRoleSet.has("pivot")) {
        score += 8;
        reasons.push(`교체 운영 축을 만들어 파티 흐름을 부드럽게 해 줍니다.`);
      }

      const threatCoverage = topThreats.filter((threat) =>
        threat.types.some((type) => candidate.resists.includes(type)),
      );
      if (threatCoverage.length > 0) {
        score += Math.min(10, threatCoverage.length * 2);
        reasons.push(`상위 메타 포켓몬을 상대로 최소한의 상성 대응력을 갖습니다.`);
      }

      if (selected.length === 0) {
        score += candidate.usage;
        reasons.push("처음 시작할 때 무난하게 넣기 좋은 기본 후보입니다.");
      }

      if (reasons.length === 0) {
        score += candidate.usage / 4;
        reasons.push("기술 폭과 기본 성능이 좋아 범용 후보로 쓰기 좋습니다.");
      }

      return { pokemon: candidate, score, reasons };
    })
    .sort((a, b) => b.score - a.score || b.pokemon.usage - a.pokemon.usage)
    .slice(0, 6);

  const topChecks = topThreats.slice(0, 4).map((pokemon) => ({
    name: toKoreanPokemonName(pokemon.name, pokemon.id),
    count: pokemon.usage,
  }));

  return {
    selected,
    roleCoverage,
    sharedWeaknesses,
    duplicateItems,
    topChecks,
    suggestions,
  };
}

export function buildItemLeaderboard(catalog: CatalogPokemon[]) {
  const counts = new Map<string, number>();

  for (const pokemon of catalog) {
    if (!pokemon.suggestedItem) {
      continue;
    }

    counts.set(pokemon.suggestedItem, (counts.get(pokemon.suggestedItem) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([item, count]) => ({ item, count }));
}

export function buildRoleOverview(catalog: CatalogPokemon[]) {
  return ROLE_PRIORITY.map((role) => ({
    role,
    count: catalog.filter((pokemon) => pokemon.roles.includes(role)).length,
  })).filter((entry) => entry.count > 0);
}

function buildTopThreats(catalog: CatalogPokemon[]) {
  return [...catalog].sort((a, b) => b.usage - a.usage).slice(0, 12);
}

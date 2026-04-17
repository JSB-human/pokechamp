import { metaThreats, pokemonData } from "@/data/champions-data";
import type { PartyAnalysis, PokemonRecord, PokemonType, RoleTag } from "@/types/pokemon";

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

export function getPokemonByName(name: string) {
  return pokemonData.find((pokemon) => pokemon.name === name);
}

export function analyzeParty(memberNames: string[]): PartyAnalysis {
  const selected = memberNames
    .map(getPokemonByName)
    .filter((pokemon): pokemon is PokemonRecord => Boolean(pokemon));

  const roleCounts = new Map<RoleTag, number>();
  const weaknessCounts = new Map<PokemonType, number>();
  const itemCounts = new Map<string, number>();
  const threatCounts = new Map<string, number>();

  for (const pokemon of selected) {
    for (const role of pokemon.roles) {
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
    }

    for (const weakness of pokemon.weaknesses) {
      weaknessCounts.set(weakness, (weaknessCounts.get(weakness) ?? 0) + 1);
    }

    const defaultItem = pokemon.sets[0]?.item;
    if (defaultItem) {
      itemCounts.set(defaultItem, (itemCounts.get(defaultItem) ?? 0) + 1);
    }

    for (const check of pokemon.checks) {
      threatCounts.set(check, (threatCounts.get(check) ?? 0) + 1);
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

  const topChecks = [...threatCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }));

  const missingRoles = ROLE_PRIORITY.filter((role) => !roleCounts.has(role));
  const selectedNames = new Set(selected.map((pokemon) => pokemon.name));

  const suggestions = pokemonData
    .filter((candidate) => !selectedNames.has(candidate.name))
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      const synergyPartners = candidate.goodWith.filter((name) => selectedNames.has(name));
      if (synergyPartners.length > 0) {
        score += synergyPartners.length * 14;
        reasons.push(`시너지 파트너 ${synergyPartners.join(", ")}와 자연스럽게 연결됩니다.`);
      }

      const weaknessFixes = sharedWeaknesses
        .filter(({ type }) => candidate.resists.includes(type))
        .map(({ type }) => type);
      if (weaknessFixes.length > 0) {
        score += weaknessFixes.length * 12;
        reasons.push(`겹치는 약점 ${weaknessFixes.join(", ")}를 받아줄 수 있습니다.`);
      }

      const fillsRoles = candidate.roles.filter((role) => missingRoles.includes(role));
      if (fillsRoles.length > 0) {
        score += fillsRoles.length * 10;
        reasons.push(`부족한 역할 ${fillsRoles.join(", ")}을 보강합니다.`);
      }

      const metaCoverage = candidate.checks.filter((threat) => metaThreats.includes(threat));
      if (metaCoverage.length > 0) {
        score += metaCoverage.length * 5;
        reasons.push(`현재 메타 핵심 포켓몬 ${metaCoverage.join(", ")} 대응력이 있습니다.`);
      }

      if (selected.length === 0) {
        score += candidate.usage;
        reasons.push("처음 시작할 때 무난하게 넣기 좋은 상위 메타 포켓몬입니다.");
      }

      return { pokemon: candidate, score, reasons };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.pokemon.usage - a.pokemon.usage)
    .slice(0, 6);

  return {
    selected,
    roleCoverage,
    sharedWeaknesses,
    duplicateItems,
    topChecks,
    suggestions,
  };
}

export function buildItemLeaderboard() {
  const counts = new Map<string, number>();

  for (const pokemon of pokemonData) {
    for (const set of pokemon.sets) {
      counts.set(set.item, (counts.get(set.item) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([item, count]) => ({ item, count }));
}

export function buildRoleOverview() {
  return ROLE_PRIORITY.map((role) => ({
    role,
    count: pokemonData.filter((pokemon) => pokemon.roles.includes(role)).length,
  })).filter((entry) => entry.count > 0);
}

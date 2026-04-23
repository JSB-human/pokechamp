import { toKoreanMoveName, toKoreanType } from "@/lib/korean";
import { ALL_TYPES, getTypeMultiplier } from "@/lib/type-chart";
import type { CollectedMove, CollectedPokemonLearnset } from "@/types/collected-data";
import type { CatalogPokemon, PokemonType } from "@/types/pokemon";

type InsightPokemon = {
  id: string;
  name: string;
  iconUrl: string | null;
  reason: string;
};

type InsightMove = {
  slug: string;
  name: string;
  type: PokemonType | null;
  power: number | null;
  reason: string;
};

type ScoredMove = {
  move: CollectedMove;
  type: PokemonType | null;
  score: number;
  stab: boolean;
  roleFit: "물리" | "특수" | "보조";
};

export type PokemonDetailInsights = {
  strongPokemon: InsightPokemon[];
  weakPokemon: InsightPokemon[];
  strongMoves: InsightMove[];
  weakMoves: InsightMove[];
  moveCombos: Array<{ title: string; moves: string[]; reason: string }>;
};

export function buildPokemonDetailInsights({
  pokemon,
  learnset,
  catalog,
  allMoves,
}: {
  pokemon: CatalogPokemon;
  learnset: CollectedPokemonLearnset | null;
  catalog: CatalogPokemon[];
  allMoves: CollectedMove[];
}): PokemonDetailInsights {
  const learnedMoves = learnset?.moves ?? [];
  const scoredMoves = scoreLearnedMoves(pokemon, learnedMoves, catalog);
  const damagingTypes = uniqueTypes(
    scoredMoves.map((entry) => entry.type).filter((type): type is PokemonType => Boolean(type)),
  );
  const attackTypes = damagingTypes.length > 0 ? damagingTypes : pokemon.types;
  const bestMoveByType = buildBestMoveByType(scoredMoves);

  const strongPokemon = catalog
    .filter((candidate) => candidate.id !== pokemon.id)
    .map((candidate) => {
      const bestType = findBestAttackType(attackTypes, candidate.types);
      const bestMove = bestMoveByType.get(bestType.type);
      const counterPressure = findBestAttackType(candidate.types, pokemon.types).multiplier;
      const safetyBonus = counterPressure <= 1 ? 22 : counterPressure >= 2 ? -28 : 0;
      const resistBonus = candidate.types.some((type) => pokemon.resists.includes(type)) ? 8 : 0;
      const moveBonus = bestMove ? bestMove.score / 6 : 0;

      return {
        candidate,
        bestType,
        bestMove,
        score: bestType.multiplier * 120 + safetyBonus + resistBonus + moveBonus + candidate.usage / 8,
      };
    })
    .filter((entry) => entry.bestType.multiplier > 1)
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)
    .map(({ candidate, bestType, bestMove }) => ({
      id: candidate.id,
      name: candidate.name,
      iconUrl: candidate.iconUrl,
      reason: bestMove
        ? `${toKoreanType(bestType.type)} 기술인 ${toKoreanMoveName(bestMove.move.name, bestMove.move.slug)}로 ${effectLabel(bestType.multiplier)} 약점을 찌릅니다.`
        : `${toKoreanType(bestType.type)} 공격이 ${effectLabel(bestType.multiplier)}로 들어갑니다.`,
    }));

  const weakPokemon = catalog
    .filter((candidate) => candidate.id !== pokemon.id)
    .map((candidate) => {
      const bestType = findBestAttackType(candidate.types, pokemon.types);
      const ourAnswer = findBestAttackType(attackTypes, candidate.types);
      const dangerBonus = pokemon.weaknesses.includes(bestType.type) ? 35 : 0;
      const answerPenalty = ourAnswer.multiplier > 1 ? -18 : ourAnswer.multiplier < 1 ? 22 : 0;

      return {
        candidate,
        bestType,
        ourAnswer,
        score: bestType.multiplier * 130 + dangerBonus + answerPenalty + candidate.usage / 6,
      };
    })
    .filter((entry) => entry.bestType.multiplier > 1)
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)
    .map(({ candidate, bestType, ourAnswer }) => ({
      id: candidate.id,
      name: candidate.name,
      iconUrl: candidate.iconUrl,
      reason:
        ourAnswer.multiplier > 1
          ? `${toKoreanType(bestType.type)} 공격이 아프지만, 맞대응 약점도 있습니다.`
          : `${toKoreanType(bestType.type)} 공격을 조심하세요. 맞대응이 쉽지 않습니다.`,
    }));

  const strongMoves = scoredMoves
    .slice(0, 6)
    .map(({ move, type, stab, roleFit }) => ({
      slug: move.slug,
      name: move.name,
      type,
      power: move.power,
      reason: buildMoveReason(move, type, stab, roleFit, countCoverage(type, catalog)),
    }));

  const weakMoves = buildThreatMoves(pokemon, allMoves);
  const moveCombos = buildMoveCombos(pokemon, learnedMoves, scoredMoves);

  return {
    strongPokemon,
    weakPokemon,
    strongMoves,
    weakMoves,
    moveCombos,
  };
}

function scoreLearnedMoves(pokemon: CatalogPokemon, learnedMoves: CollectedMove[], catalog: CatalogPokemon[]) {
  return learnedMoves
    .filter((move) => move.damageClass !== "status")
    .map((move): ScoredMove => {
      const type = normalizeType(move.type);
      const stab = type ? pokemon.types.includes(type) : false;
      const roleFit = getRoleFit(pokemon, move);
      const roleBonus = roleFit === "물리" || roleFit === "특수" ? 18 : 0;
      const accuracyBonus = move.accuracy == null ? 5 : Math.max(-20, (move.accuracy - 80) / 2);
      const coverageBonus = type ? Math.min(35, countCoverage(type, catalog) / 4) : 0;

      return {
        move,
        type,
        stab,
        roleFit,
        score: (move.power ?? 0) + (stab ? 35 : 0) + roleBonus + accuracyBonus + coverageBonus,
      };
    })
    .sort((left, right) => right.score - left.score || (right.move.power ?? 0) - (left.move.power ?? 0));
}

function buildBestMoveByType(scoredMoves: ScoredMove[]) {
  const bestMoveByType = new Map<PokemonType, ScoredMove>();

  for (const entry of scoredMoves) {
    if (!entry.type) {
      continue;
    }

    const current = bestMoveByType.get(entry.type);
    if (!current || entry.score > current.score) {
      bestMoveByType.set(entry.type, entry);
    }
  }

  return bestMoveByType;
}

function buildThreatMoves(pokemon: CatalogPokemon, allMoves: CollectedMove[]) {
  const seenTypes = new Set<PokemonType>();

  return allMoves
    .filter((move) => move.damageClass !== "status")
    .map((move) => {
      const type = normalizeType(move.type);
      const multiplier = type ? getTypeMultiplier(type, pokemon.types) : 1;
      const accuracyBonus = move.accuracy == null ? 0 : Math.max(-15, (move.accuracy - 85) / 3);
      return {
        move,
        type,
        multiplier,
        score: multiplier * 140 + (move.power ?? 0) + accuracyBonus,
      };
    })
    .filter((entry) => entry.type && entry.multiplier > 1)
    .sort((left, right) => right.score - left.score)
    .filter((entry) => {
      if (!entry.type || seenTypes.has(entry.type)) {
        return false;
      }

      seenTypes.add(entry.type);
      return true;
    })
    .slice(0, 6)
    .map(({ move, type, multiplier }) => ({
      slug: move.slug,
      name: move.name,
      type,
      power: move.power,
      reason: `${toKoreanType(type!)} ${effectLabel(multiplier)} 약점입니다. 고위력 기술이면 바로 위험합니다.`,
    }));
}

function buildMoveCombos(
  pokemon: CatalogPokemon,
  learnedMoves: CollectedMove[],
  scoredMoves: ScoredMove[],
) {
  const bySlug = new Map(learnedMoves.map((move) => [move.slug, move.name]));
  const protect = bySlug.get("protect");
  const speedControl = findFirstMove(bySlug, ["tailwind", "trick-room", "icy-wind", "electroweb", "thunder-wave"]);
  const support = findFirstMove(bySlug, ["fake-out", "follow-me", "rage-powder", "wide-guard", "helping-hand", "taunt"]);
  const setup = findFirstMove(bySlug, ["swords-dance", "nasty-plot", "calm-mind", "bulk-up", "dragon-dance"]);
  const stabAttacks = scoredMoves.filter((entry) => entry.stab).map((entry) => entry.move.name);
  const coverageAttacks = scoredMoves.filter((entry) => !entry.stab).map((entry) => entry.move.name);
  const topAttacks = scoredMoves.map((entry) => entry.move.name);

  const balanced = uniqueNames([stabAttacks[0], coverageAttacks[0] ?? topAttacks[1], protect, support ?? speedControl]).slice(0, 4);
  const aggressive = uniqueNames([stabAttacks[0], stabAttacks[1] ?? coverageAttacks[0], coverageAttacks[1], setup ?? speedControl]).slice(0, 4);
  const safe = uniqueNames([protect, support, speedControl, stabAttacks[0] ?? topAttacks[0]]).slice(0, 4);

  return [
    {
      title: "기본 안정 조합",
      moves: balanced.length > 0 ? balanced : pokemon.featuredMoves.slice(0, 4),
      reason: "자속 공격, 견제기, 보호·보조기를 섞어서 처음 굴리기 편한 구성입니다.",
    },
    {
      title: "압박형 조합",
      moves: aggressive.length > 0 ? aggressive : pokemon.featuredMoves.slice(0, 4),
      reason: "화력과 랭크업 또는 속도 조절을 앞세워 상대 교체를 압박합니다.",
    },
    {
      title: "보조형 조합",
      moves: safe.length > 0 ? safe : pokemon.featuredMoves.slice(0, 4),
      reason: "보호, 속도 조절, 보조기를 우선해 파티 안정성을 높이는 구성입니다.",
    },
  ].filter((combo) => combo.moves.length > 0);
}

function getRoleFit(pokemon: CatalogPokemon, move: CollectedMove): ScoredMove["roleFit"] {
  if (move.damageClass === "physical" && pokemon.baseStats.atk >= pokemon.baseStats.spa - 10) {
    return "물리";
  }
  if (move.damageClass === "special" && pokemon.baseStats.spa >= pokemon.baseStats.atk - 10) {
    return "특수";
  }

  return "보조";
}

function findBestAttackType(attackTypes: PokemonType[], defendTypes: PokemonType[]) {
  return attackTypes
    .map((type) => ({ type, multiplier: getTypeMultiplier(type, defendTypes) }))
    .sort((left, right) => right.multiplier - left.multiplier)[0] ?? { type: "Normal" as PokemonType, multiplier: 1 };
}

function countCoverage(type: PokemonType | null, catalog: CatalogPokemon[]) {
  if (!type) {
    return 0;
  }

  return catalog.filter((pokemon) => getTypeMultiplier(type, pokemon.types) > 1).length;
}

function buildMoveReason(
  move: CollectedMove,
  moveType: PokemonType | null,
  stab: boolean,
  roleFit: ScoredMove["roleFit"],
  coverageCount: number,
) {
  const pieces: string[] = [];

  if (stab) {
    pieces.push("자속 보정");
  }
  if ((move.power ?? 0) >= 100) {
    pieces.push("고위력");
  }
  if (roleFit !== "보조") {
    pieces.push(`${roleFit} 성향과 잘 맞음`);
  }
  if (moveType && coverageCount > 0) {
    pieces.push(`${toKoreanType(moveType)} 견제`);
  }

  return pieces.length > 0 ? pieces.join(" · ") : "기술폭 보완용";
}

function normalizeType(type: string | null): PokemonType | null {
  return ALL_TYPES.find((entry) => entry === type) ?? null;
}

function uniqueTypes(types: PokemonType[]) {
  return [...new Set(types)];
}

function uniqueNames(values: Array<string | undefined | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function findFirstMove(bySlug: Map<string, string>, slugs: string[]) {
  for (const slug of slugs) {
    const move = bySlug.get(slug);
    if (move) {
      return move;
    }
  }

  return null;
}

function effectLabel(multiplier: number) {
  if (multiplier >= 4) {
    return "4배";
  }
  if (multiplier >= 2) {
    return "2배";
  }
  return `${multiplier}배`;
}

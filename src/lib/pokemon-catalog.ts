import { pokemonData } from "@/data/champions-data";
import {
  getCollectedPokemon,
  getCollectedPokemonLearnsets,
} from "@/lib/collected-data";
import { toKoreanMoveName, toKoreanRole, toKoreanTypes } from "@/lib/korean";
import { ALL_TYPES, getTypeMultiplier } from "@/lib/type-chart";
import type { CollectedMove } from "@/types/collected-data";
import type { CatalogPokemon, PokemonRecord, PokemonType, RoleTag } from "@/types/pokemon";
const PRIORITY_MOVES = new Set(["fake-out", "quick-attack", "extreme-speed", "sucker-punch", "aqua-jet", "vacuum-wave", "upper-hand", "mach-punch", "bullet-punch", "ice-shard", "shadow-sneak", "grassy-glide"]);
const SUPPORT_MOVES = new Set(["helping-hand", "follow-me", "rage-powder", "wide-guard", "quick-guard", "tailwind", "encore", "taunt", "coaching", "life-dew", "strength-sap", "spore", "sleep-powder", "will-o-wisp"]);
const PIVOT_MOVES = new Set(["u-turn", "volt-switch", "flip-turn", "parting-shot", "baton-pass", "chilly-reception"]);
const SPEED_CONTROL_MOVES = new Set(["tailwind", "trick-room", "icy-wind", "electroweb", "thunder-wave", "rock-tomb", "bulldoze"]);
const RAIN_MOVES = new Set(["rain-dance", "thunder", "weather-ball", "hurricane"]);
const SUN_MOVES = new Set(["sunny-day", "solar-beam", "solar-blade", "weather-ball", "heat-wave"]);

const FEATURED_MOVE_PRIORITY = [
  "protect",
  "fake-out",
  "tailwind",
  "trick-room",
  "close-combat",
  "dire-claw",
  "knock-off",
  "parting-shot",
  "heat-wave",
  "wave-crash",
  "draco-meteor",
  "moonblast",
];

function getOverlayMap() {
  return new Map(
    pokemonData.map((entry) => [entry.id, entry]),
  );
}

export function getCatalogPokemon(): CatalogPokemon[] {
  const collected = getCollectedPokemon();
  const learnsets = getCollectedPokemonLearnsets();
  const learnsetBySlug = new Map(learnsets.map((entry) => [entry.slug, entry]));
  const overlayBySlug = getOverlayMap();

  const source = collected.filter((entry) => entry.regulationSets.length > 0 && !isMegaForm(entry.slug, entry.name));

  return source
    .map((entry) => {
      const overlay = overlayBySlug.get(entry.slug) ?? findOverlayByName(entry.name);
      const learnset = learnsetBySlug.get(entry.slug);
      const moves = learnset?.moves ?? [];
      const megaVariants = entry.megaVariants.map((mega) => {
        const formEntry =
          collected.find(
            (candidate) =>
              candidate.nationalNumber === entry.nationalNumber &&
              isMegaForm(candidate.slug, candidate.name) &&
              sameStats(candidate.baseStats, mega.stats),
          ) ?? null;

        return {
          id: formEntry?.slug ?? mega.megaStoneSlug ?? `${entry.slug}-mega`,
          name: formEntry?.name ?? `Mega ${entry.name}`,
          iconUrl: formEntry?.iconUrl ?? entry.iconUrl,
          types: (formEntry?.types ?? entry.types) as PokemonType[],
          typeDetails: (formEntry?.typeDetails ?? entry.typeDetails) as Array<{
            name: PokemonType;
            slug: string;
            iconUrl: string | null;
          }>,
          baseStats: mega.stats,
          abilityName: mega.abilityName,
          abilitySlug: mega.abilitySlug,
          megaStoneName: mega.megaStoneName,
          megaStoneSlug: mega.megaStoneSlug,
          megaStoneIconUrl: mega.megaStoneIconUrl,
        };
      });
      const roles = deriveRoles(entry.types as PokemonType[], entry.baseStats, moves, overlay);
      const typeSummary = summarizeTypeMatchups(entry.types as PokemonType[]);
      const featuredMoves = deriveFeaturedMoves(moves, entry.types as PokemonType[], overlay);
      const usage = overlay?.usage ?? estimateUsage(entry.baseStats, moves.length, roles, entry.isFinalForm);

      return {
        id: entry.slug,
        name: entry.name,
        iconUrl: entry.iconUrl,
        usage,
        usageLabel: overlay ? `${overlay.usage.toFixed(1)}%` : `추천 ${Math.round(usage)}`,
        types: entry.types as PokemonType[],
        typeDetails: entry.typeDetails as Array<{ name: PokemonType; slug: string; iconUrl: string | null }>,
        baseStats: entry.baseStats,
        weaknesses: typeSummary.weaknesses,
        resists: typeSummary.resists,
        roles,
        moveCount: moves.length,
        featuredMoves,
        notes: overlay?.notes ?? buildNotes(entry.types as PokemonType[], roles, moves.length),
        suggestedItem: overlay?.sets[0]?.item ?? entry.megaVariants[0]?.megaStoneName ?? null,
        suggestedAbility: overlay?.sets[0]?.ability ?? entry.megaVariants[0]?.abilityName ?? null,
        setLabel: overlay?.sets[0]?.label ?? (featuredMoves.length > 0 ? "대표 운용 예시" : null),
        setSummary:
          overlay?.sets[0]?.summary ??
          (featuredMoves.length > 0
            ? `주요 기술 ${featuredMoves
                .slice(0, 4)
                .map((move) => toKoreanMoveName(move))
                .join(", ")} 기준으로 기본 운용 예시를 구성했습니다.`
            : null),
        megaVariants,
      } satisfies CatalogPokemon;
    })
    .sort((left, right) => right.usage - left.usage || right.moveCount - left.moveCount);
}

export function isMegaForm(slug: string, name?: string) {
  return /-mega($|-)/.test(slug) || Boolean(name?.toLowerCase().startsWith("mega "));
}

export function getBaseSlugForMegaForm(slug: string) {
  if (/-mega-[a-z0-9]+$/.test(slug)) {
    return slug.replace(/-mega-[a-z0-9]+$/, "");
  }

  if (slug.endsWith("-mega")) {
    return slug.replace(/-mega$/, "");
  }

  return slug;
}

function sameStats(
  left: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
  right: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
) {
  return (
    left.hp === right.hp &&
    left.atk === right.atk &&
    left.def === right.def &&
    left.spa === right.spa &&
    left.spd === right.spd &&
    left.spe === right.spe
  );
}

function findOverlayByName(name: string) {
  const normalized = slugify(name);
  return pokemonData.find((entry) => entry.id === normalized || slugify(entry.name) === normalized);
}

function deriveRoles(
  types: PokemonType[],
  baseStats: CatalogPokemon["baseStats"],
  moves: CollectedMove[],
  overlay?: PokemonRecord,
): RoleTag[] {
  if (overlay) {
    return overlay.roles;
  }

  const roleSet = new Set<RoleTag>();
  const moveSlugs = new Set(moves.map((move) => move.slug));
  const physicalMoves = moves.filter((move) => move.damageClass === "physical").length;
  const specialMoves = moves.filter((move) => move.damageClass === "special").length;
  const bst = baseStats.hp + baseStats.atk + baseStats.def + baseStats.spa + baseStats.spd + baseStats.spe;

  if (baseStats.spe >= 95 || hasAny(moveSlugs, SPEED_CONTROL_MOVES)) {
    roleSet.add("speed-control");
  }
  if (hasAny(moveSlugs, PIVOT_MOVES)) {
    roleSet.add("pivot");
  }
  if (hasAny(moveSlugs, SUPPORT_MOVES) || baseStats.hp + baseStats.def + baseStats.spd >= 260) {
    roleSet.add("support");
  }
  if (hasAny(moveSlugs, RAIN_MOVES) || (types.includes("Water") && moveSlugs.has("weather-ball"))) {
    roleSet.add("rain");
  }
  if (hasAny(moveSlugs, SUN_MOVES) || (types.includes("Fire") && moveSlugs.has("weather-ball"))) {
    roleSet.add("sun");
  }
  if (moveSlugs.has("trick-room")) {
    roleSet.add("trick-room");
  }
  if (hasAny(moveSlugs, PRIORITY_MOVES)) {
    roleSet.add("priority");
  }
  if (baseStats.hp + baseStats.def + baseStats.spd >= 270) {
    roleSet.add("bulky");
  }
  if (baseStats.atk >= baseStats.spa + 15 || physicalMoves > specialMoves + 8) {
    roleSet.add("physical-attacker");
  }
  if (baseStats.spa >= baseStats.atk + 15 || specialMoves > physicalMoves + 8) {
    roleSet.add("special-attacker");
  }
  if (Math.max(baseStats.atk, baseStats.spa) >= 115 || bst >= 560) {
    roleSet.add("breaker");
  }
  if (baseStats.spe >= 100 && Math.max(baseStats.atk, baseStats.spa) >= 100) {
    roleSet.add("sweeper");
  }
  if (baseStats.spe >= 105) {
    roleSet.add("lead");
  }

  if (roleSet.size === 0) {
    roleSet.add("support");
  }

  return [...roleSet];
}

function summarizeTypeMatchups(types: PokemonType[]) {
  const weaknesses: PokemonType[] = [];
  const resists: PokemonType[] = [];

  for (const attackType of ALL_TYPES) {
    const multiplier = getTypeMultiplier(attackType, types);

    if (multiplier > 1) {
      weaknesses.push(attackType);
    } else if (multiplier < 1) {
      resists.push(attackType);
    }
  }

  return { weaknesses, resists };
}

function deriveFeaturedMoves(
  moves: CollectedMove[],
  types: PokemonType[],
  overlay?: PokemonRecord,
) {
  if (overlay?.sets[0]?.moves?.length) {
    return overlay.sets[0].moves;
  }

  const bySlug = new Map(moves.map((move) => [move.slug, move.name]));
  const selected: string[] = [];

  for (const slug of FEATURED_MOVE_PRIORITY) {
    const name = bySlug.get(slug);
    if (name && !selected.includes(name)) {
      selected.push(name);
    }
    if (selected.length >= 4) {
      return selected;
    }
  }

  const stabMoves = moves
    .filter((move) => move.type && types.includes(move.type as PokemonType) && move.damageClass !== "status")
    .sort((left, right) => (right.power ?? 0) - (left.power ?? 0))
    .map((move) => move.name);

  for (const name of stabMoves) {
    if (!selected.includes(name)) {
      selected.push(name);
    }
    if (selected.length >= 4) {
      return selected;
    }
  }

  for (const move of moves) {
    if (!selected.includes(move.name)) {
      selected.push(move.name);
    }
    if (selected.length >= 4) {
      return selected;
    }
  }

  return selected;
}

function buildNotes(types: PokemonType[], roles: RoleTag[], moveCount: number) {
  const typeText = toKoreanTypes(types).join(" / ");
  const roleText = roles.slice(0, 3).map((role) => toKoreanRole(role)).join(", ");
  return `${typeText} 타입 기반으로 ${roleText} 역할을 기대할 수 있고, 확인된 기술은 ${moveCount}개입니다.`;
}

function estimateUsage(
  baseStats: CatalogPokemon["baseStats"],
  moveCount: number,
  roles: RoleTag[],
  isFinalForm: boolean,
) {
  const bst = baseStats.hp + baseStats.atk + baseStats.def + baseStats.spa + baseStats.spd + baseStats.spe;
  return (
    (isFinalForm ? 25 : 10) +
    Math.min(25, moveCount / 5) +
    Math.min(35, bst / 18) +
    roles.length * 4
  );
}

function hasAny(haystack: Set<string>, needles: Set<string>) {
  for (const needle of needles) {
    if (haystack.has(needle)) {
      return true;
    }
  }

  return false;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

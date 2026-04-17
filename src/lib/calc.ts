import { smartnuoNatureStats } from "@/lib/smartnuo";

export type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

export function calculateFinalStat({
  base,
  iv = 31,
  effort = 0,
  level = 50,
  natureSlug = "serious",
  stat,
}: {
  base: number;
  iv?: number;
  effort?: number;
  level?: number;
  natureSlug?: string;
  stat: Exclude<StatKey, "hp">;
}) {
  const nature = smartnuoNatureStats[natureSlug] ?? smartnuoNatureStats.serious;
  const raw = Math.floor(((2 * base + iv + Math.floor(effort / 4)) * level) / 100) + 5;
  return Math.floor(raw * nature[stat]);
}

export function calculateHpStat({
  base,
  iv = 31,
  effort = 0,
  level = 50,
}: {
  base: number;
  iv?: number;
  effort?: number;
  level?: number;
}) {
  return Math.floor(((2 * base + iv + Math.floor(effort / 4)) * level) / 100) + level + 10;
}

export function estimateDamage({
  attack,
  defense,
  power,
  stab = 1,
  effectiveness = 1,
  modifier = 1,
}: {
  attack: number;
  defense: number;
  power: number;
  stab?: number;
  effectiveness?: number;
  modifier?: number;
}) {
  const core = Math.max(1, Math.floor(((22 * power * attack) / Math.max(defense, 1)) / 50) + 2);
  const max = Math.floor(core * stab * effectiveness * modifier);
  const min = Math.floor(max * 0.85);
  return { min, max };
}

export function estimatePowerIndex({
  attack,
  power,
  stab = 1,
}: {
  attack: number;
  power: number;
  stab?: number;
}) {
  return Math.round(attack * power * stab);
}

export function estimateBulkIndex({
  hp,
  defense,
}: {
  hp: number;
  defense: number;
}) {
  return Math.round(hp * defense);
}

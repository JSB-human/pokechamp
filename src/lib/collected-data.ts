import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  CollectedAbility,
  CollectedItem,
  CollectedMove,
  CollectedOverview,
  CollectedPokemon,
  CollectedPokemonLearnset,
  NamuOverview,
} from "@/types/collected-data";

const rootDir = process.cwd();
const normalizedDir = path.join(rootDir, "data", "normalized");

function readJson<T>(fileName: string): T {
  const filePath = path.join(normalizedDir, fileName);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export function getCollectedPokemon() {
  return readJson<CollectedPokemon[]>("pokebase-pokemon-index.json");
}

export function getCollectedPokemonBySlug(slug: string) {
  return getCollectedPokemon().find((entry) => entry.slug === slug) ?? null;
}

export function getCollectedPokemonLearnsets() {
  return readJson<CollectedPokemonLearnset[]>("pokebase-pokemon-learnsets.json");
}

export function getCollectedPokemonLearnset(slug: string) {
  return getCollectedPokemonLearnsets().find((entry) => entry.slug === slug) ?? null;
}

export function getCollectedAbilities() {
  return readJson<CollectedAbility[]>("pokebase-ability-index.json");
}

export function getCollectedItems() {
  return readJson<CollectedItem[]>("pokebase-items.json");
}

export function getCollectedMoves() {
  return readJson<CollectedMove[]>("pokebase-moves.json");
}

export function getOpggOverview() {
  return readJson<CollectedOverview>("opgg-overview.json");
}

export function getNamuOverview() {
  return readJson<NamuOverview>("namu-overview.json");
}

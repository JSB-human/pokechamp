export type CollectedTypeRef = {
  name: string;
  slug: string;
  iconUrl: string | null;
};

export type CollectedBaseStats = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

export type CollectedMegaVariant = {
  megaStoneName: string | null;
  megaStoneSlug: string | null;
  megaStoneIconUrl: string | null;
  abilityName: string | null;
  abilitySlug: string | null;
  stats: CollectedBaseStats;
};

export type CollectedPokemon = {
  slug: string;
  name: string;
  nationalNumber: number;
  iconUrl: string | null;
  usage: number | null;
  isFinalForm: boolean;
  generation: string | null;
  regulationSets: string[];
  types: string[];
  typeDetails: CollectedTypeRef[];
  baseStats: CollectedBaseStats;
  megaVariants: CollectedMegaVariant[];
};

export type CollectedAbility = {
  slug: string;
  name: string;
  description: string;
  pokemon: string[];
};

export type CollectedItem = {
  name: string;
  slug: string;
  description: string;
  iconUrl: string | null;
  category: string | null;
  availableInChampions: boolean;
  unlock: string | null;
};

export type CollectedMove = {
  name: string;
  slug: string;
  type: string | null;
  typeSlug: string | null;
  typeIconUrl: string | null;
  damageClass: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  description: string;
};

export type CollectedPokemonLearnset = {
  slug: string;
  moveCount: number;
  moves: CollectedMove[];
};

export type CollectedOverview = {
  title: string;
  pokemonCount: number | null;
  moveCount: number | null;
  itemCount: number | null;
  abilityCount: number | null;
  hasCalculator: boolean;
  hasTypeChart: boolean;
  hasTierBuilder: boolean;
};

export type NamuOverview = {
  title: string;
  headings: string[];
  summaryParagraphs: string[];
};

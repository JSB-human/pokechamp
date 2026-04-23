export type PokemonType =
  | "Normal"
  | "Fire"
  | "Water"
  | "Electric"
  | "Grass"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Dark"
  | "Steel"
  | "Fairy";

export type RoleTag =
  | "lead"
  | "speed-control"
  | "pivot"
  | "support"
  | "rain"
  | "sun"
  | "sweeper"
  | "breaker"
  | "priority"
  | "bulky"
  | "trick-room"
  | "special-attacker"
  | "physical-attacker";

export type PokemonSet = {
  label: string;
  item: string;
  ability: string;
  moves: string[];
  summary: string;
};

export type PokemonRecord = {
  id: string;
  name: string;
  usage: number;
  types: PokemonType[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  weaknesses: PokemonType[];
  resists: PokemonType[];
  roles: RoleTag[];
  goodWith: string[];
  checks: string[];
  notes: string;
  sourceUpdatedAt: string;
  sets: PokemonSet[];
};

export type TeamPreset = {
  id: string;
  name: string;
  description: string;
  members: string[];
};

export type CatalogPokemon = {
  id: string;
  name: string;
  iconUrl: string | null;
  usage: number;
  usageLabel: string;
  types: PokemonType[];
  typeDetails: Array<{ name: PokemonType; slug: string; iconUrl: string | null }>;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  weaknesses: PokemonType[];
  resists: PokemonType[];
  roles: RoleTag[];
  moveCount: number;
  featuredMoves: string[];
  notes: string;
  suggestedItem: string | null;
  suggestedItemDescription: string | null;
  suggestedAbility: string | null;
  suggestedAbilityDescription: string | null;
  setLabel: string | null;
  setSummary: string | null;
  megaVariants: CatalogMegaVariant[];
  featuredMoveDetails: Array<{
    name: string;
    slug: string;
    type: PokemonType | null;
    power: number | null;
    description: string;
  }>;
};

export type CatalogMegaVariant = {
  id: string;
  name: string;
  iconUrl: string | null;
  types: PokemonType[];
  typeDetails: Array<{ name: PokemonType; slug: string; iconUrl: string | null }>;
  baseStats: CatalogPokemon["baseStats"];
  abilityName: string | null;
  abilitySlug: string | null;
  megaStoneName: string | null;
  megaStoneSlug: string | null;
  megaStoneIconUrl: string | null;
};

export type PartyAnalysis = {
  selected: CatalogPokemon[];
  roleCoverage: RoleTag[];
  sharedWeaknesses: Array<{ type: PokemonType; count: number }>;
  duplicateItems: Array<{ item: string; count: number }>;
  topChecks: Array<{ name: string; count: number }>;
  suggestions: Array<{
    pokemon: CatalogPokemon;
    score: number;
    reasons: string[];
  }>;
};

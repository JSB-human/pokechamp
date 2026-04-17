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

export type PartyAnalysis = {
  selected: PokemonRecord[];
  roleCoverage: RoleTag[];
  sharedWeaknesses: Array<{ type: PokemonType; count: number }>;
  duplicateItems: Array<{ item: string; count: number }>;
  topChecks: Array<{ name: string; count: number }>;
  suggestions: Array<{
    pokemon: PokemonRecord;
    score: number;
    reasons: string[];
  }>;
};

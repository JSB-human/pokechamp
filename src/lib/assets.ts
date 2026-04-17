const POKEMON_DB_BASE = "https://img.pokemondb.net/sprites/home/normal";
const POKEAPI_ITEM_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

const pokemonSlugOverrides: Record<string, string> = {
  "wash-rotom": "rotom-wash",
  basculegion: "basculegion-male",
  "mega-floette": "floette",
};

const itemSlugOverrides: Record<string, string> = {
  "mega-stone": "poke-ball",
  "black-glasses": "black-glasses",
  "clear-amulet": "clear-amulet",
};

const typePalette: Record<string, { bg: string; fg: string; border: string }> = {
  Normal: { bg: "#f4f4f5", fg: "#3f3f46", border: "#d4d4d8" },
  Fire: { bg: "#ffedd5", fg: "#9a3412", border: "#fdba74" },
  Water: { bg: "#dbeafe", fg: "#1d4ed8", border: "#93c5fd" },
  Electric: { bg: "#fef9c3", fg: "#a16207", border: "#fde047" },
  Grass: { bg: "#dcfce7", fg: "#166534", border: "#86efac" },
  Ice: { bg: "#e0f2fe", fg: "#0f766e", border: "#a5f3fc" },
  Fighting: { bg: "#fee2e2", fg: "#991b1b", border: "#fca5a5" },
  Poison: { bg: "#f3e8ff", fg: "#7e22ce", border: "#d8b4fe" },
  Ground: { bg: "#fef3c7", fg: "#92400e", border: "#fcd34d" },
  Flying: { bg: "#ede9fe", fg: "#5b21b6", border: "#c4b5fd" },
  Psychic: { bg: "#fce7f3", fg: "#be185d", border: "#f9a8d4" },
  Bug: { bg: "#ecfccb", fg: "#4d7c0f", border: "#bef264" },
  Rock: { bg: "#f5f5f4", fg: "#57534e", border: "#d6d3d1" },
  Ghost: { bg: "#e0e7ff", fg: "#4338ca", border: "#c7d2fe" },
  Dragon: { bg: "#e0e7ff", fg: "#312e81", border: "#a5b4fc" },
  Dark: { bg: "#e7e5e4", fg: "#292524", border: "#a8a29e" },
  Steel: { bg: "#e2e8f0", fg: "#334155", border: "#cbd5e1" },
  Fairy: { bg: "#fdf2f8", fg: "#be185d", border: "#fbcfe8" },
  Stellar: { bg: "#fffbeb", fg: "#a16207", border: "#fde68a" },
  unknown: { bg: "#f3f4f6", fg: "#4b5563", border: "#d1d5db" },
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/:/g, "")
    .replace(/\s+/g, "-");
}

export function getPokemonImageUrl(slugOrName: string, preferredUrl?: string | null) {
  if (preferredUrl) {
    return preferredUrl;
  }

  const slug = pokemonSlugOverrides[toSlug(slugOrName)] ?? toSlug(slugOrName);
  return `${POKEMON_DB_BASE}/${slug}.png`;
}

export function getItemImageUrl(slugOrName: string, preferredUrl?: string | null) {
  if (preferredUrl) {
    return preferredUrl;
  }

  const slug = itemSlugOverrides[toSlug(slugOrName)] ?? toSlug(slugOrName);
  return `${POKEAPI_ITEM_BASE}/${slug}.png`;
}

export function getTypePalette(type: string) {
  return typePalette[type] ?? typePalette.unknown;
}

export function getPokeballFallback() {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#ffffff" stroke="#111827" stroke-width="6"/>
      <path d="M10 64h108" stroke="#111827" stroke-width="8"/>
      <path d="M14 64a50 50 0 0 1 100 0H14Z" fill="#ef4444"/>
      <circle cx="64" cy="64" r="17" fill="#ffffff" stroke="#111827" stroke-width="6"/>
      <circle cx="64" cy="64" r="7" fill="#d1d5db"/>
    </svg>
  `);
}

export function getItemFallback() {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect x="20" y="20" width="88" height="88" rx="26" fill="#f8fafc" stroke="#cbd5e1" stroke-width="6"/>
      <path d="M44 36h40v18H44z" fill="#fb923c"/>
      <path d="M38 54h52v38H38z" fill="#fed7aa"/>
      <circle cx="64" cy="73" r="10" fill="#f97316"/>
    </svg>
  `);
}

function toDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

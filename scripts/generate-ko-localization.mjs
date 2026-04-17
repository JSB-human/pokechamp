import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const normalizedDir = path.join(rootDir, "data", "normalized");

async function main() {
  const [moves, items, abilities, pokemon] = await Promise.all([
    readJson("pokebase-moves.json"),
    readJson("pokebase-items.json"),
    readJson("pokebase-ability-index.json"),
    readJson("pokebase-pokemon-index.json"),
  ]);

  const [opggMovesHtml, opggItemsHtml, opggAbilitiesHtml, opggPokedexHtml] = await Promise.all([
    fetchHtml("https://op.gg/ko/pokemon-champions/moves"),
    fetchHtml("https://op.gg/ko/pokemon-champions/items"),
    fetchHtml("https://op.gg/ko/pokemon-champions/abilities"),
    fetchHtml("https://op.gg/ko/pokemon-champions/pokedex"),
  ]);

  const moveKo = parseOpggMoves(opggMovesHtml, moves);
  const itemKo = parseOpggItems(opggItemsHtml, items);
  const abilityKo = parseOpggAbilities(opggAbilitiesHtml, abilities);
  const pokemonKo = await parseOpggPokedex(opggPokedexHtml, pokemon);

  const localization = {
    generatedAt: new Date().toISOString(),
    pokemonBySlug: pokemonKo,
    moveBySlug: moveKo,
    itemBySlug: itemKo,
    abilityBySlug: abilityKo,
  };

  await mkdir(normalizedDir, { recursive: true });
  await writeFile(
    path.join(normalizedDir, "ko-localization.json"),
    `${JSON.stringify(localization, null, 2)}\n`,
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        generatedAt: localization.generatedAt,
        counts: {
          pokemon: Object.keys(pokemonKo).length,
          moves: Object.keys(moveKo).length,
          items: Object.keys(itemKo).length,
          abilities: Object.keys(abilityKo).length,
        },
      },
      null,
      2,
    ),
  );
}

async function readJson(fileName) {
  const content = await readFile(path.join(normalizedDir, fileName), "utf8");
  return JSON.parse(content);
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    },
  });

  return res.text();
}

async function parseOpggPokedex(html, pokemon) {
  const map = {};
  const regex = /aria-label="([^"]+)" href="\/ko\/pokemon-champions\/pokedex\/([^"]+)"/g;

  for (const match of html.matchAll(regex)) {
    map[match[2]] = { name: decodeEntities(match[1]) };
  }

  for (const entry of pokemon) {
    const existing = map[entry.slug]?.name;
    if (!existing || existing === entry.name) {
      const koName = await fetchPokemonKoName(entry.slug);
      map[entry.slug] = { name: koName ?? fallbackPokemonName(entry.slug, entry.name) };
    }
  }

  return map;
}

function parseOpggMoves(html, moves) {
  const map = {};
  const regex =
    /href="\/ko\/pokemon-champions\/moves\/([^"]+)"[\s\S]*?<h3 class="font-medium">([^<]+)<\/h3>[\s\S]*?<p class="text-muted-foreground line-clamp-2 text-xs">([^<]+)<\/p>/g;

  for (const match of html.matchAll(regex)) {
    map[match[1]] = {
      name: decodeEntities(match[2]),
      description: decodeEntities(match[3]),
    };
  }

  for (const move of moves) {
    if (!map[move.slug]) {
      map[move.slug] = {
        name: fallbackTitle(move.name),
        description: "설명 준비 중",
      };
    }
  }

  return map;
}

function parseOpggItems(html, items) {
  const map = {};
  const regex =
    /href="\/ko\/pokemon-champions\/items\/([^"]+)"[\s\S]*?<img alt="([^"]+)"[\s\S]*?<span class="w-fit rounded-full[^"]*">([^<]+)<\/span>[\s\S]*?<p class="text-muted-foreground text-xs">([^<]+)<\/p>[\s\S]*?<div class="mt-1 flex flex-wrap gap-2 text-\[10px\]">([\s\S]*?)<\/div>/g;

  for (const match of html.matchAll(regex)) {
    const unlock = decodeEntities(match[5]).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    map[match[1]] = {
      name: decodeEntities(match[2]),
      category: decodeEntities(match[3]),
      description: decodeEntities(match[4]),
      unlock,
    };
  }

  for (const item of items) {
    if (!map[item.slug]) {
      map[item.slug] = {
        name: fallbackTitle(item.name),
        category: translateItemCategory(item.category),
        description: "설명 준비 중",
        unlock: translateUnlock(item.unlock),
      };
    }
  }

  return map;
}

function parseOpggAbilities(html, abilities) {
  const map = {};
  const regex =
    /href="\/ko\/pokemon-champions\/abilities\/([^"]+)"[\s\S]*?<h3 class="group-hover:text-primary flex items-center gap-1\.5 text-sm font-bold">([^<]+)<\/h3><p class="text-muted-foreground line-clamp-2 text-xs">([^<]+)<\/p>/g;

  for (const match of html.matchAll(regex)) {
    map[match[1]] = {
      name: decodeEntities(match[2]),
      description: decodeEntities(match[3]),
    };
  }

  for (const ability of abilities) {
    if (!map[ability.slug]) {
      map[ability.slug] = {
        name: fallbackTitle(ability.name),
        description: "설명 준비 중",
      };
    }
  }

  return map;
}

function fallbackPokemonName(slug, englishName) {
  const manual = {
    "rotom-wash": "워시로토무",
    "mega-floette": "메가플라엣테",
    sneasler: "포푸니크",
    incineroar: "어흥염",
    garchomp: "한카리아스",
    kingambit: "대도각참",
    basculegion: "대쓰여너",
    sinistcha: "과미드라",
  };

  if (manual[slug]) {
    return manual[slug];
  }

  return fallbackTitle(englishName);
}

async function fetchPokemonKoName(slug) {
  const speciesSlug = toSpeciesSlug(slug);
  if (!speciesSlug) {
    return null;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesSlug}`);
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const koName = data.names?.find((entry) => entry.language?.name === "ko")?.name;
    return koName ?? null;
  } catch {
    return null;
  }
}

function toSpeciesSlug(slug) {
  const manual = {
    "rotom-wash": "rotom",
    "mega-floette": null,
  };

  if (slug in manual) {
    return manual[slug];
  }

  return slug
    .replace(/^mega-/, "")
    .replace(/-x$/, "")
    .replace(/-y$/, "");
}

function fallbackTitle(value) {
  return value;
}

function translateItemCategory(category) {
  const map = {
    "mega-evolution": "메가스톤",
    "held-item": "지닌 아이템",
    berry: "열매",
  };

  return map[category ?? ""] ?? "기타";
}

function translateUnlock(unlock) {
  if (!unlock) {
    return "정보 없음";
  }

  if (unlock === "beginning") {
    return "처음부터 사용 가능";
  }

  if (unlock.startsWith("shop-")) {
    return `상점 해금 (${unlock.replace("shop-", "").toUpperCase()})`;
  }

  return unlock;
}

function decodeEntities(input) {
  return input
    .replace(/&#x([0-9a-fA-f]+);/g, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

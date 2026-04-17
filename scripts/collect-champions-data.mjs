import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "data");
const rawDir = path.join(outputDir, "raw");
const normalizedDir = path.join(outputDir, "normalized");
const pokemonDetailRawDir = path.join(rawDir, "pokebase", "pokemon-details");

const SOURCES = {
  pokebase: {
    overview: "https://pokebase.app/pokemon-champions",
    pokemon: "https://pokebase.app/pokemon-champions/pokemon",
    moves: "https://pokebase.app/pokemon-champions/moves",
    items: "https://pokebase.app/pokemon-champions/items",
    abilities: "https://pokebase.app/pokemon-champions/abilities",
  },
  opgg: {
    overview: "https://op.gg/ko/pokemon-champions/",
    calculator: "https://op.gg/ko/pokemon-champions/calculator",
    typeChart: "https://op.gg/pokemon-champions/type-effectiveness",
  },
  namu: {
    overview:
      "https://namu.wiki/w/%ED%8F%AC%EC%BC%93%EB%AA%AC%20%EC%B1%94%ED%94%BC%EC%96%B8%EC%8A%A4",
  },
};

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const DETAIL_CONCURRENCY = 8;

async function main() {
  await ensureDirs();

  const fetched = await fetchAllPages();

  const pokebasePokemon = parsePokebasePokemonIndex(fetched.pokebase.pokemon.html);
  const pokebaseAbilities = parsePokebaseAbilityIndex(fetched.pokebase.abilities.html);
  const pokebaseItems = parsePokebaseItems(fetched.pokebase.items.html);
  const pokebaseMoves = parsePokebaseMoves(fetched.pokebase.moves.html);
  const pokebaseLearnsets = await collectPokebasePokemonLearnsets(pokebasePokemon);
  const opggOverview = parseOpggOverview(fetched.opgg.overview.html);
  const namuOverview = parseNamuOverview(fetched.namu.overview.html);

  const manifest = {
    generatedAt: new Date().toISOString(),
    pages: summarizeFetches(fetched),
    counts: {
      pokebasePokemon: pokebasePokemon.length,
      pokebaseAbilities: pokebaseAbilities.length,
      pokebaseItems: pokebaseItems.length,
      pokebaseMoves: pokebaseMoves.length,
      pokebaseLearnsets: pokebaseLearnsets.filter((entry) => entry.moveCount > 0).length,
      pokebaseLearnsetMoves: pokebaseLearnsets.reduce((sum, entry) => sum + entry.moveCount, 0),
    },
  };

  await Promise.all([
    writeJson(path.join(normalizedDir, "manifest.json"), manifest),
    writeJson(path.join(normalizedDir, "pokebase-pokemon-index.json"), pokebasePokemon),
    writeJson(path.join(normalizedDir, "pokebase-pokemon-learnsets.json"), pokebaseLearnsets),
    writeJson(path.join(normalizedDir, "pokebase-ability-index.json"), pokebaseAbilities),
    writeJson(path.join(normalizedDir, "pokebase-items.json"), pokebaseItems),
    writeJson(path.join(normalizedDir, "pokebase-moves.json"), pokebaseMoves),
    writeJson(path.join(normalizedDir, "opgg-overview.json"), opggOverview),
    writeJson(path.join(normalizedDir, "namu-overview.json"), namuOverview),
  ]);

  console.log(JSON.stringify(manifest, null, 2));
}

async function ensureDirs() {
  await Promise.all([
    mkdir(rawDir, { recursive: true }),
    mkdir(normalizedDir, { recursive: true }),
    mkdir(path.join(rawDir, "pokebase"), { recursive: true }),
    mkdir(path.join(rawDir, "opgg"), { recursive: true }),
    mkdir(path.join(rawDir, "namu"), { recursive: true }),
    mkdir(pokemonDetailRawDir, { recursive: true }),
  ]);
}

async function fetchAllPages() {
  const result = {};

  for (const [sourceName, entries] of Object.entries(SOURCES)) {
    result[sourceName] = {};

    for (const [pageName, url] of Object.entries(entries)) {
      const html = await fetchHtml(url);
      const filePath = path.join(rawDir, sourceName, `${pageName}.html`);

      await writeText(filePath, html);

      result[sourceName][pageName] = {
        url,
        status: 200,
        fetchedAt: new Date().toISOString(),
        bytes: Buffer.byteLength(html, "utf8"),
        html,
      };
    }
  }

  return result;
}

async function fetchHtml(url, attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: HEADERS });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(300 * attempt);
      }
    }
  }

  throw lastError;
}

function summarizeFetches(fetched) {
  return Object.fromEntries(
    Object.entries(fetched).map(([sourceName, pages]) => [
      sourceName,
      Object.fromEntries(
        Object.entries(pages).map(([pageName, entry]) => [
          pageName,
          {
            url: entry.url,
            status: entry.status,
            fetchedAt: entry.fetchedAt,
            bytes: entry.bytes,
          },
        ]),
      ),
    ]),
  );
}

function parsePokebasePokemonIndex(html) {
  const usageBySlug = parsePokebasePokemonUsageMap(html);
  const docsArrays = extractEscapedDocsArrays(html);
  const docs = selectDocsArray(
    docsArrays,
    (entry) =>
      typeof entry?.name === "string" &&
      typeof entry?.nationalNumber === "number" &&
      Array.isArray(entry?.type) &&
      entry?.icon?.url,
  );

  return docs.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    nationalNumber: entry.nationalNumber,
    iconUrl: entry.icon?.url ?? null,
    usage: usageBySlug.get(entry.slug) ?? null,
    isFinalForm: Boolean(entry.isFinalForm),
    generation: entry.generation ?? null,
    regulationSets: Array.isArray(entry.regulationSets)
      ? entry.regulationSets.map((set) => set.name).filter(Boolean)
      : [],
    types: entry.type.map((type) => type.name),
    typeDetails: entry.type.map((type) => ({
      name: type.name,
      slug: type.slug ?? slugify(type.name),
      iconUrl: type.icon?.url ?? null,
    })),
    baseStats: {
      hp: entry.hp ?? 0,
      atk: entry.attack ?? 0,
      def: entry.defense ?? 0,
      spa: entry.specialAttack ?? 0,
      spd: entry.specialDefense ?? 0,
      spe: entry.speed ?? 0,
    },
    megaVariants: Array.isArray(entry.megaVariants)
      ? entry.megaVariants.map((variant) => ({
          megaStoneName: variant.megaStone?.name ?? null,
          megaStoneSlug: variant.megaStone?.slug ?? null,
          megaStoneIconUrl: variant.megaStone?.icon?.url ?? null,
          abilityName: variant.megaAbility?.name ?? null,
          abilitySlug: variant.megaAbility?.slug ?? null,
          stats: {
            hp: variant.megaHp ?? entry.hp ?? 0,
            atk: variant.megaAttack ?? entry.attack ?? 0,
            def: variant.megaDefense ?? entry.defense ?? 0,
            spa: variant.megaSpecialAttack ?? entry.specialAttack ?? 0,
            spd: variant.megaSpecialDefense ?? entry.specialDefense ?? 0,
            spe: variant.megaSpeed ?? entry.speed ?? 0,
          },
        }))
      : [],
  }));
}

function parsePokebasePokemonUsageMap(html) {
  const rows = html
    .split('<div class="table-row odd:bg-zinc-50 dark:odd:bg-zinc-950">')
    .slice(1);

  const usageBySlug = new Map();

  for (const row of rows) {
    const hrefMatch = row.match(/href="\/pokemon-champions\/pokemon\/([^"]+)"/);
    const usageMatch = row.match(/<span class="text-xs tabular-nums">([\d.]+)%<\/span>/);

    if (!hrefMatch || !usageMatch) {
      continue;
    }

    usageBySlug.set(hrefMatch[1], Number.parseFloat(usageMatch[1]));
  }

  return usageBySlug;
}

function parsePokebaseAbilityIndex(html) {
  const docsArrays = extractEscapedDocsArrays(html);
  const docs = selectDocsArray(
    docsArrays,
    (entry) => typeof entry?.name === "string" && typeof entry?.description === "string",
  );

  if (docs.length > 0) {
    return dedupeBy(
      docs.map((entry) => ({
        slug: entry.slug,
        name: entry.name,
        description: cleanText(entry.description),
        pokemon: dedupe(
          Array.isArray(entry.pokemon)
            ? entry.pokemon.map((pokemon) => pokemon?.name).filter(Boolean)
            : [],
        ),
      })),
      "slug",
    );
  }

  const rows = html
    .split('<div class="table-row odd:bg-zinc-50 dark:odd:bg-zinc-950">')
    .slice(1);

  return dedupeBy(
    rows
      .map((row) => {
        const hrefMatch = row.match(/href="\/pokemon-champions\/abilities\/([^"]+)"/);
        const nameMatch = row.match(
          /href="\/pokemon-champions\/abilities\/[^"]+">([^<]+)<\/a>/,
        );
        const descriptionMatch = row.match(
          /<div class="whitespace-pre-wrap text-base">([\s\S]*?)<\/div>/,
        );
        const pokemonMatches = [
          ...row.matchAll(/aria-label="([^"]+) .*?open Pok.+?mon page"/g),
        ].map((match) => decodeEntities(match[1]));

        if (!hrefMatch || !nameMatch || !descriptionMatch) {
          return null;
        }

        return {
          slug: hrefMatch[1],
          name: decodeEntities(nameMatch[1]),
          description: cleanText(descriptionMatch[1]),
          pokemon: dedupe(pokemonMatches),
        };
      })
      .filter(Boolean),
    "slug",
  );
}

function parsePokebaseItems(html) {
  const docs = selectDocsArray(
    extractEscapedDocsArrays(html),
    (entry) => typeof entry?.name === "string" && typeof entry?.slug === "string" && entry?.icon?.url,
  );

  return docs.map((item) => ({
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
    iconUrl: item.icon?.url ?? null,
    category: item.category ?? null,
    availableInChampions: item.availableInChampions ?? false,
    unlock: item.unlock ?? null,
  }));
}

function parsePokebaseMoves(html) {
  const docs = selectDocsArray(
    extractEscapedDocsArrays(html),
    (entry) =>
      typeof entry?.name === "string" &&
      typeof entry?.slug === "string" &&
      entry?.type?.name &&
      entry?.type?.icon?.url,
  );

  return docs.map(mapMoveEntry);
}

async function collectPokebasePokemonLearnsets(pokemon) {
  const results = await mapLimit(pokemon, DETAIL_CONCURRENCY, async (entry) => {
    const url = `${SOURCES.pokebase.pokemon}/${entry.slug}`;
    const html = await fetchHtml(url);
    const filePath = path.join(pokemonDetailRawDir, `${entry.slug}.html`);

    await writeText(filePath, html);

    const docs = selectDocsArray(
      extractEscapedDocsArrays(html),
      (move) =>
        typeof move?.name === "string" &&
        typeof move?.slug === "string" &&
        typeof move?.damageClass === "string" &&
        move?.type?.name,
    );

    const moves = docs.map(mapMoveEntry);

    return {
      slug: entry.slug,
      moveCount: moves.length,
      moves,
    };
  });

  return results;
}

function mapMoveEntry(move) {
  return {
    name: move.name,
    slug: move.slug,
    type: move.type?.name ?? null,
    typeSlug: move.type?.slug ?? null,
    typeIconUrl: move.type?.icon?.url ?? null,
    damageClass: move.damageClass ?? null,
    power: move.power ?? null,
    accuracy: move.accuracy ?? null,
    pp: move.pp ?? null,
    description: move.description ?? "",
  };
}

function parseOpggOverview(html) {
  const text = collapseWhitespace(stripTags(html));

  return {
    title: extractTitle(html),
    pokemonCount: extractNumber(text, /Pok[eé]mon[^.]{0,80}?(\d+)\s*(?:Pokemon|Pok[eé]mon)/iu),
    moveCount: extractNumber(text, /moves?[^.]{0,80}?(\d+)\s*(?:moves?|Moves?)/iu),
    itemCount: extractNumber(text, /items?[^.]{0,80}?(\d+)\s*(?:items?|Items?)/iu),
    abilityCount: extractNumber(text, /abilities?[^.]{0,80}?(\d+)\s*(?:abilities?|Abilities?)/iu),
    hasCalculator: /calculator/i.test(text),
    hasTypeChart: /type effectiveness|type chart/i.test(text),
    hasTierBuilder: /builder/i.test(text),
  };
}

function parseNamuOverview(html) {
  const title = extractTitle(html);
  const headingMatches = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((match) =>
    cleanText(match[2]),
  );
  const paragraphMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((match) => cleanText(match[1]))
    .filter((text) => text.length >= 30)
    .slice(0, 8);

  return {
    title,
    headings: dedupe(headingMatches).slice(0, 20),
    summaryParagraphs: paragraphMatches,
  };
}

function extractEscapedDocsArrays(html) {
  const token = '\\"docs\\":[';
  const arrays = [];
  let cursor = 0;

  while (cursor < html.length) {
    const tokenIndex = html.indexOf(token, cursor);
    if (tokenIndex === -1) {
      break;
    }

    const arrayStart = tokenIndex + token.length - 1;
    const arrayEnd = findMatchingBracket(html, arrayStart);
    if (arrayEnd === -1) {
      break;
    }

    const rawArray = html.slice(arrayStart, arrayEnd + 1);

    try {
      arrays.push(JSON.parse(unescapeJson(rawArray)));
    } catch {
      // Ignore malformed arrays and continue scanning.
    }

    cursor = arrayEnd + 1;
  }

  return arrays;
}

function findMatchingBracket(input, startIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function selectDocsArray(arrays, predicate) {
  return (
    arrays
      .filter((array) => Array.isArray(array) && array.some((entry) => predicate(entry)))
      .sort((left, right) => right.length - left.length)[0] ?? []
  );
}

function extractTitle(html) {
  return decodeEntities(html.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
}

function stripTags(input) {
  return decodeEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function cleanText(input) {
  return collapseWhitespace(stripTags(input));
}

function collapseWhitespace(input) {
  return input.replace(/\s+/g, " ").trim();
}

function unescapeJson(input) {
  return input
    .replace(/\\"/g, '"')
    .replace(/\\u([\dA-Fa-f]{4})/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .replace(/\\\//g, "/")
    .replace(/\\n/g, " ")
    .replace(/\\\\/g, "\\");
}

function decodeEntities(input) {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function extractNumber(input, pattern) {
  const match = input.match(pattern);
  return match ? Number.parseInt(match[1], 10) : null;
}

function dedupe(items) {
  return [...new Set(items)];
}

function dedupeBy(items, key) {
  return [...new Map(items.map((item) => [item[key], item])).values()];
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeText(filePath, value) {
  await writeFile(filePath, value, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

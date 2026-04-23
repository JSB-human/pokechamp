import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const normalizedDir = path.join(rootDir, "data", "normalized");
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

const manualMoveNames = {
  "blood-moon": "블러드문",
  "combat-torque": "컴뱃토크",
  "darkest-lariat": "DD래리어트",
  "magical-torque": "매지컬토크",
  "noxious-torque": "노시어스토크",
  recover: "HP회복",
  "shadow-blast": "섀도블라스트",
  "shadow-blitz": "섀도블리츠",
  "shadow-bolt": "섀도볼트",
  "shadow-break": "섀도브레이크",
  "shadow-chill": "섀도칠",
  "shadow-down": "섀도다운",
  "shadow-end": "섀도엔드",
  "shadow-fire": "섀도파이어",
  "shadow-half": "섀도하프",
  "shadow-hold": "섀도홀드",
  "shadow-mist": "섀도미스트",
  "shadow-panic": "섀도패닉",
  "shadow-rave": "섀도레이브",
  "shadow-rush": "섀도러시",
  "shadow-shed": "섀도셰드",
  "shadow-sky": "섀도스카이",
  "shadow-storm": "섀도스톰",
  "shadow-wave": "섀도웨이브",
  "v-create": "V제너레이트",
  "wicked-torque": "위키드토크",
};

const manualItemNames = {
  chandelurite: "샹델라나이트",
  chesnaughtite: "브리가론나이트",
  chimechite: "치렁나이트",
  clefablite: "픽시나이트",
  crabominite: "하리비등나이트",
  delphoxite: "마폭시나이트",
  dragoninite: "망나뇽나이트",
  drampanite: "할비롱나이트",
  emboarite: "염무왕나이트",
  excadrite: "몰드류나이트",
  "fairy-feather": "페어리깃털",
  feraligite: "장크로다일나이트",
  floettite: "플라엣테나이트",
  froslassite: "눈여아나이트",
  glimmoranite: "킬라플로르나이트",
  golurkite: "골루그나이트",
  greninjite: "개굴닌자나이트",
  hawluchanite: "루차불나이트",
  meganiumite: "메가니움나이트",
  meowsticite: "냐오닉스나이트",
  scovillainite: "스코빌런나이트",
  skarmorite: "무장조나이트",
  starminite: "아쿠스타나이트",
  victreebelite: "우츠보트나이트",
};

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
  const pokemonKo = parseOpggPokedex(opggPokedexHtml, pokemon);

  const movePokeApi = await fetchMoveLocalizationMap(moves);
  const itemPokeApi = await fetchItemLocalizationMap(items);
  const abilityPokeApi = await fetchAbilityLocalizationMap(abilities);
  const pokemonPokeApi = await fetchPokemonLocalizationMap(pokemon);

  const localization = {
    generatedAt: new Date().toISOString(),
    pokemonBySlug: mergePokemonLocalization(pokemon, pokemonKo, pokemonPokeApi),
    moveBySlug: mergeMoveLocalization(moves, moveKo, movePokeApi),
    itemBySlug: mergeItemLocalization(items, itemKo, itemPokeApi),
    abilityBySlug: mergeAbilityLocalization(abilities, abilityKo, abilityPokeApi),
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
          pokemon: Object.keys(localization.pokemonBySlug).length,
          moves: Object.keys(localization.moveBySlug).length,
          items: Object.keys(localization.itemBySlug).length,
          abilities: Object.keys(localization.abilityBySlug).length,
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
      "user-agent": userAgent,
    },
  });

  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": userAgent,
      accept: "application/json",
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

async function mapLimit(items, limit, iteratee) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await iteratee(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function parseOpggPokedex(html, pokemon) {
  const map = {};
  const regex = /aria-label="([^"]+)" href="\/ko\/pokemon-champions\/pokedex\/([^"]+)"/g;

  for (const match of html.matchAll(regex)) {
    map[match[2]] = { name: decodeEntities(match[1]) };
  }

  for (const entry of pokemon) {
    map[entry.slug] ??= {};
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
    map[move.slug] ??= {};
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
    map[item.slug] ??= {};
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
    map[ability.slug] ??= {};
  }

  return map;
}

async function fetchMoveLocalizationMap(moves) {
  const uniqueSlugs = [...new Set(moves.map((entry) => entry.slug))];
  const result = {};

  const entries = await mapLimit(uniqueSlugs, 8, async (slug) => {
    const data = await fetchJson(`https://pokeapi.co/api/v2/move/${slug}`);
    return [slug, extractMoveLocalization(data)];
  });

  for (const [slug, value] of entries) {
    if (value) {
      result[slug] = value;
    }
  }

  return result;
}

async function fetchItemLocalizationMap(items) {
  const uniqueSlugs = [...new Set(items.map((entry) => entry.slug))];
  const result = {};

  const entries = await mapLimit(uniqueSlugs, 8, async (slug) => {
    const data = await fetchJson(`https://pokeapi.co/api/v2/item/${slug}`);
    return [slug, extractItemLocalization(data)];
  });

  for (const [slug, value] of entries) {
    if (value) {
      result[slug] = value;
    }
  }

  return result;
}

async function fetchAbilityLocalizationMap(abilities) {
  const uniqueSlugs = [...new Set(abilities.map((entry) => entry.slug))];
  const result = {};

  const entries = await mapLimit(uniqueSlugs, 8, async (slug) => {
    const data = await fetchJson(`https://pokeapi.co/api/v2/ability/${slug}`);
    return [slug, extractAbilityLocalization(data)];
  });

  for (const [slug, value] of entries) {
    if (value) {
      result[slug] = value;
    }
  }

  return result;
}

async function fetchPokemonLocalizationMap(pokemon) {
  const result = {};

  const entries = await mapLimit(pokemon, 8, async (entry) => {
    const speciesData = await fetchPokemonSpecies(entry.slug);
    return [entry.slug, extractPokemonLocalization(speciesData, entry)];
  });

  for (const [slug, value] of entries) {
    if (value) {
      result[slug] = value;
    }
  }

  return result;
}

async function fetchPokemonSpecies(slug) {
  const visited = new Set();
  let candidate = slug;

  while (candidate && !visited.has(candidate)) {
    visited.add(candidate);
    const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${candidate}`);
    if (data) {
      return data;
    }

    if (candidate.startsWith("mega-")) {
      candidate = candidate.slice(5);
      continue;
    }

    candidate = candidate.includes("-") ? candidate.replace(/-[^-]+$/, "") : "";
  }

  return null;
}

function extractMoveLocalization(data) {
  if (!data) {
    return null;
  }

  return {
    name: getLocalizedName(data.names),
    description: getLocalizedMoveDescription(data.flavor_text_entries),
  };
}

function extractItemLocalization(data) {
  if (!data) {
    return null;
  }

  return {
    name: getLocalizedName(data.names),
    description: getLocalizedItemDescription(data.flavor_text_entries),
  };
}

function extractAbilityLocalization(data) {
  if (!data) {
    return null;
  }

  return {
    name: getLocalizedName(data.names),
    description: getLocalizedAbilityDescription(data.flavor_text_entries, data.effect_entries),
  };
}

function extractPokemonLocalization(data, entry) {
  if (!data) {
    return null;
  }

  const baseName = getLocalizedName(data.names);
  return {
    name: localizePokemonFormName(entry.slug, entry.name, baseName),
    description: getLocalizedPokemonDescription(data.flavor_text_entries),
  };
}

function mergeMoveLocalization(moves, opggMap, pokeApiMap) {
  const result = {};

  for (const move of moves) {
    const opgg = opggMap[move.slug] ?? {};
    const pokeApi = pokeApiMap[move.slug] ?? {};
    result[move.slug] = {
      name: pickKoreanText(manualMoveNames[move.slug], opgg.name, pokeApi.name, move.name),
      description: pickKoreanText(opgg.description, pokeApi.description, move.description, "설명 준비 중"),
    };
  }

  return result;
}

function mergeItemLocalization(items, opggMap, pokeApiMap) {
  const result = {};

  for (const item of items) {
    const opgg = opggMap[item.slug] ?? {};
    const pokeApi = pokeApiMap[item.slug] ?? {};
    result[item.slug] = {
      name: pickKoreanText(manualItemNames[item.slug], pokeApi.name, opgg.name, item.name),
      category: pickKoreanText(opgg.category, translateItemCategory(item.category), "기타"),
      description: pickKoreanText(pokeApi.description, opgg.description, item.description, "설명 준비 중"),
      unlock: pickKoreanText(opgg.unlock, translateUnlock(item.unlock), "정보 없음"),
    };
  }

  return result;
}

function mergeAbilityLocalization(abilities, opggMap, pokeApiMap) {
  const result = {};

  for (const ability of abilities) {
    const opgg = opggMap[ability.slug] ?? {};
    const pokeApi = pokeApiMap[ability.slug] ?? {};
    result[ability.slug] = {
      name: pickKoreanText(opgg.name, pokeApi.name, ability.name),
      description: pickKoreanText(opgg.description, pokeApi.description, ability.description, "설명 준비 중"),
    };
  }

  return result;
}

function mergePokemonLocalization(pokemon, opggMap, pokeApiMap) {
  const result = {};

  for (const entry of pokemon) {
    const opgg = opggMap[entry.slug] ?? {};
    const pokeApi = pokeApiMap[entry.slug] ?? {};
    result[entry.slug] = {
      name: pickKoreanText(opgg.name, pokeApi.name, localizePokemonFormName(entry.slug, entry.name)),
      description: pickKoreanText(pokeApi.description, "설명 준비 중"),
    };
  }

  return result;
}

function getLocalizedName(names) {
  return cleanText(names?.find((entry) => entry.language?.name === "ko")?.name);
}

function getLocalizedMoveDescription(entries) {
  return normalizeFlavorText(entries?.find((entry) => entry.language?.name === "ko")?.flavor_text);
}

function getLocalizedItemDescription(entries) {
  return normalizeFlavorText(entries?.find((entry) => entry.language?.name === "ko")?.text);
}

function getLocalizedAbilityDescription(flavorEntries, effectEntries) {
  return (
    normalizeFlavorText(flavorEntries?.find((entry) => entry.language?.name === "ko")?.flavor_text) ??
    normalizeFlavorText(effectEntries?.find((entry) => entry.language?.name === "ko")?.short_effect)
  );
}

function getLocalizedPokemonDescription(entries) {
  return normalizeFlavorText(entries?.find((entry) => entry.language?.name === "ko")?.flavor_text);
}

function normalizeFlavorText(value) {
  return cleanText(value)?.replace(/[\f\n\r]+/g, " ").replace(/\s+/g, " ");
}

function cleanText(value) {
  if (!value) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function containsKorean(value) {
  return /[가-힣]/.test(value ?? "");
}

function pickKoreanText(...values) {
  for (const value of values) {
    if (containsKorean(value)) {
      return value;
    }
  }

  for (const value of values) {
    if (cleanText(value)) {
      return value;
    }
  }

  return null;
}

function localizePokemonFormName(slug, englishName, baseKoName = null) {
  const baseName = baseKoName ?? englishName;

  if (slug.endsWith("-gmax")) {
    return `${baseName} 거다이맥스`;
  }

  if (slug.includes("-mega-x")) {
    return `메가 ${baseName} X`;
  }

  if (slug.includes("-mega-y")) {
    return `메가 ${baseName} Y`;
  }

  if (slug.startsWith("mega-") || slug.includes("-mega")) {
    return `메가 ${baseName}`;
  }

  if (slug.endsWith("-hisui")) {
    return `히스이 ${baseName}`;
  }

  if (slug.endsWith("-alola")) {
    return `알로라 ${baseName}`;
  }

  if (slug.endsWith("-galar")) {
    return `가라르 ${baseName}`;
  }

  if (slug.includes("-paldea")) {
    return `팔데아 ${baseName}`;
  }

  if (slug.endsWith("-bloodmoon")) {
    return `${baseName} 블러드문`;
  }

  if (slug.endsWith("-school")) {
    return `${baseName} 군집폼`;
  }

  if (slug.endsWith("-blade")) {
    return `${baseName} 블레이드폼`;
  }

  if (slug.endsWith("-shield")) {
    return `${baseName} 실드폼`;
  }

  if (slug.endsWith("-speed")) {
    return `${baseName} 스피드폼`;
  }

  if (slug.endsWith("-attack")) {
    return `${baseName} 어택폼`;
  }

  if (slug.endsWith("-defense")) {
    return `${baseName} 디펜스폼`;
  }

  if (slug.endsWith("-origin")) {
    return `${baseName} 오리진폼`;
  }

  if (slug.endsWith("-therian")) {
    return `${baseName} 영물폼`;
  }

  if (slug.endsWith("-incarnate")) {
    return `${baseName} 화신폼`;
  }

  if (slug.endsWith("-crowned")) {
    return `${baseName} 왕관폼`;
  }

  if (slug.endsWith("-dusk-mane")) {
    return `${baseName} 황혼의 갈기`;
  }

  if (slug.endsWith("-dawn-wings")) {
    return `${baseName} 새벽의 날개`;
  }

  if (slug.endsWith("-complete")) {
    return `${baseName} 퍼펙트폼`;
  }

  if (slug.endsWith("-10")) {
    return `${baseName} 10%폼`;
  }

  if (slug.endsWith("-50")) {
    return `${baseName} 50%폼`;
  }

  if (slug.endsWith("-aqua-breed")) {
    return `${baseName} 물결무늬종`;
  }

  if (slug.endsWith("-blaze-breed")) {
    return `${baseName} 불꽃무늬종`;
  }

  if (slug.endsWith("-combat-breed")) {
    return `${baseName} 투쟁무늬종`;
  }

  return baseName;
}

function translateItemCategory(category) {
  const map = {
    "mega-evolution": "메가스톤",
    "held-item": "지닌 아이템",
    held: "지닌 아이템",
    berry: "열매",
    berries: "열매",
    battle: "배틀 아이템",
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
    .replace(/&#x([0-9a-fA-f]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
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

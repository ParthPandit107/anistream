import { Anime } from "./types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const FORBIDDEN_KEYWORDS = [
  "loli",
  "lolicon",
  "lolis",
  "shota",
  "shotacon",
  "underage",
  "child",
  "kodomo",
  "lolita",
  "pico",
  "boku no pico",
  "shoujo ramune",
  "ramune",
  "chico",
  "cozo",
];

const BLACKLISTED_TITLES = [
  "boku no pico",
  "shoujo ramune",
  "pico to chico",
  "pico x chico x cozo",
  "kodomo no jikan",
  "aki-sora",
];

export function isForbiddenQuery(query: string): boolean {
  if (!query) return false;
  const lower = query.toLowerCase();
  return FORBIDDEN_KEYWORDS.some((kw) => lower.includes(kw));
}

export function filterSafeMedia<T extends { title?: any; description?: string; genres?: string[]; tags?: any[]; isAdult?: boolean }>(
  mediaList: T[],
  allowAdult = false
): T[] {
  return (mediaList || []).filter((item) => {
    if (!item) return false;
    if (!allowAdult && item.isAdult) return false;

    const titleEng = (item.title?.english || "").toLowerCase();
    const titleRom = (item.title?.romaji || "").toLowerCase();
    const titleUser = (item.title?.userPreferred || "").toLowerCase();
    const titleNative = (item.title?.native || "").toLowerCase();
    const fullTitle = `${titleEng} ${titleRom} ${titleUser} ${titleNative}`;

    const isBlacklisted = BLACKLISTED_TITLES.some(
      (bt) => titleEng.includes(bt) || titleRom.includes(bt) || titleUser.includes(bt) || fullTitle.includes(bt)
    );
    if (isBlacklisted) return false;

    const description = (item.description || "").toLowerCase();
    const genres = (item.genres || []).map((g) => g.toLowerCase());
    const tags = (item.tags || []).map((t) => (t?.name || "").toLowerCase());

    const containsForbidden = FORBIDDEN_KEYWORDS.some((kw) => {
      return (
        fullTitle.includes(kw) ||
        description.includes(kw) ||
        genres.includes(kw) ||
        tags.some((tagName) => tagName.includes(kw))
      );
    });

    return !containsForbidden;
  });
}

function deduplicateList(list: Anime[]): Anime[] {
  const seen = new Set<number>();
  return list.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL Error");
  }
  return json.data;
}

function normalizeMedia(media: any): Anime {
  const characters = (media.characters?.edges || []).map((edge: any) => ({
    id: edge.node.id,
    name: edge.node.name?.full || edge.node.name?.userPreferred || "Unknown",
    image: edge.node.image?.large || edge.node.image?.medium,
    role: edge.role || "MAIN",
    voiceActor:
      edge.voiceActors && edge.voiceActors.length > 0
        ? {
            id: edge.voiceActors[0].id,
            name: edge.voiceActors[0].name?.full || edge.voiceActors[0].name?.userPreferred,
            image: edge.voiceActors[0].image?.large || edge.voiceActors[0].image?.medium,
            language: edge.voiceActors[0].languageV2 || "Japanese",
          }
        : null,
  }));

  const staff = (media.staff?.edges || []).map((edge: any) => ({
    id: edge.node.id,
    name: edge.node.name?.full || edge.node.name?.userPreferred || "Unknown",
    role: edge.role || "Staff",
    image: edge.node.image?.large || edge.node.image?.medium,
  }));

  const seasons = (media.relations?.edges || [])
    .filter((edge: any) => edge.node && edge.node.type === "ANIME")
    .map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title?.english || edge.node.title?.userPreferred || edge.node.title?.romaji,
      format: edge.node.format || "TV",
      relationType: edge.relationType || "PREQUEL",
      year: edge.node.seasonYear || "",
    }));

  let releasedEpisodes = media.episodes;
  if (media.nextAiringEpisode) {
    releasedEpisodes = media.nextAiringEpisode.episode - 1;
  } else if (!releasedEpisodes && media.status === "RELEASING") {
    releasedEpisodes = 12;
  }

  return {
    id: media.id,
    malId: media.idMal,
    title: media.title?.english || media.title?.userPreferred || media.title?.romaji || "Untitled Anime",
    nativeTitle: media.title?.native,
    coverImage: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium,
    bannerImage: media.bannerImage || media.coverImage?.extraLarge,
    synopsis: (media.description || "No synopsis available.").replace(/<[^>]*>?/gm, ""),
    genres: media.genres || [],
    episodes: media.episodes || 24,
    releasedEpisodes: releasedEpisodes && releasedEpisodes > 0 ? releasedEpisodes : media.episodes || 12,
    rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : "N/A",
    status: media.status || "UNKNOWN",
    year: media.seasonYear || "N/A",
    season: media.season || "",
    studios: (media.studios?.nodes || []).map((s: any) => s.name),
    format: media.format || "TV",
    characters,
    staff,
    seasons,
  };
}

const MEDIA_FIELDS = `
  id
  idMal
  isAdult
  title { romaji english native userPreferred }
  coverImage { extraLarge large medium }
  bannerImage
  description(asHtml: false)
  genres
  tags { name }
  episodes
  nextAiringEpisode { episode }
  averageScore
  status
  seasonYear
  season
  format
  studios(isMain: true) { nodes { name } }
`;

export async function getTrendingAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 18) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await fetchGraphQL(query);
  const safe = filterSafeMedia(data.Page.media || [], false);
  return deduplicateList(safe.map(normalizeMedia));
}

export async function getPopularAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 18) {
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await fetchGraphQL(query);
  const safe = filterSafeMedia(data.Page.media || [], false);
  return deduplicateList(safe.map(normalizeMedia));
}

export async function searchAnime(
  search?: string,
  genre?: string,
  year?: string,
  status?: string,
  format?: string,
  page = 1
): Promise<Anime[]> {
  const vars: Record<string, any> = { page };
  const varDefs: string[] = ["$page: Int"];
  const mediaArgs: string[] = ["type: ANIME", "isAdult: false", "sort: POPULARITY_DESC"];

  if (search && search.trim()) {
    vars.search = search.trim();
    varDefs.push("$search: String");
    mediaArgs.push("search: $search");
  }

  if (genre && genre !== "All") {
    vars.genre = genre;
    varDefs.push("$genre: String");
    mediaArgs.push("genre: $genre");
  }

  if (status && status !== "All") {
    vars.status = status;
    varDefs.push("$status: MediaStatus");
    mediaArgs.push("status: $status");
  }

  if (format && format !== "All") {
    vars.format = format;
    varDefs.push("$format: MediaFormat");
    mediaArgs.push("format: $format");
  }

  if (year && year !== "All") {
    if (year === "2020s") {
      mediaArgs.push("startDate_greater: 20200101", "startDate_lesser: 20270101");
    } else if (year === "2010s") {
      mediaArgs.push("startDate_greater: 20100101", "startDate_lesser: 20200101");
    } else if (year === "2000s") {
      mediaArgs.push("startDate_greater: 20000101", "startDate_lesser: 20100101");
    } else if (year === "1990s") {
      mediaArgs.push("startDate_greater: 19900101", "startDate_lesser: 20000101");
    } else if (year === "1980s") {
      mediaArgs.push("startDate_greater: 19800101", "startDate_lesser: 19900101");
    } else if (year === "1970s") {
      mediaArgs.push("startDate_greater: 19700101", "startDate_lesser: 19800101");
    } else if (year === "1960s") {
      mediaArgs.push("startDate_greater: 19500101", "startDate_lesser: 19700101");
    }
  }

  const query = `
    query (${varDefs.join(", ")}) {
      Page(page: $page, perPage: 30) {
        media(${mediaArgs.join(", ")}) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL(query, vars);
    const safe = filterSafeMedia(data.Page.media || [], false);
    return deduplicateList(safe.map(normalizeMedia));
  } catch (e) {
    console.error("Search query error:", e);
    return [];
  }
}

export async function getAnimeDetail(id: number | string): Promise<Anime | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        relations {
          edges {
            relationType
            node { id idMal type title { romaji english userPreferred } format seasonYear coverImage { large medium } }
          }
        }
        characters(sort: [ROLE, RELEVANCE], perPage: 12) {
          edges {
            role
            node { id name { full userPreferred } image { large medium } }
            voiceActors(language: JAPANESE, sort: [RELEVANCE]) { id name { full userPreferred } image { large medium } languageV2 }
          }
        }
        staff(sort: [RELEVANCE], perPage: 12) {
          edges {
            role
            node { id name { full userPreferred } image { large medium } }
          }
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL(query, { id: parseInt(id.toString(), 10) });
    if (!data.Media) return null;
    const isSafe = filterSafeMedia([data.Media], false).length > 0;
    if (!isSafe) return null;
    return normalizeMedia(data.Media);
  } catch (e) {
    console.error("getAnimeDetail error:", e);
    return null;
  }
}

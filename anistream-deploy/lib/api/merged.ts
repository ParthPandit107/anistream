import { Anime, Episode } from "../types";
import { apiCache } from "../cache";
import {
  getAniListTrending,
  getAniListPopular,
  getAniListTopRated,
  searchAniList,
  getAniListDetail,
} from "./anilist";
import { getJikanAnimeDetail, searchJikanAnime } from "./jikan";

export async function getTrendingAnime(): Promise<Anime[]> {
  const cacheKey = "anime:trending";
  const cached = apiCache.get<Anime[]>(cacheKey);
  if (cached) return cached;

  try {
    const list = await getAniListTrending(1, 15);
    apiCache.set(cacheKey, list, 1800);
    return list;
  } catch (err) {
    return [];
  }
}

export async function getPopularAnime(): Promise<Anime[]> {
  const cacheKey = "anime:popular";
  const cached = apiCache.get<Anime[]>(cacheKey);
  if (cached) return cached;

  try {
    const list = await getAniListPopular(1, 15);
    apiCache.set(cacheKey, list, 1800);
    return list;
  } catch (err) {
    return [];
  }
}

export async function getTopRatedAnime(): Promise<Anime[]> {
  const cacheKey = "anime:top";
  const cached = apiCache.get<Anime[]>(cacheKey);
  if (cached) return cached;

  try {
    const list = await getAniListTopRated(1, 15);
    apiCache.set(cacheKey, list, 1800);
    return list;
  } catch (err) {
    return [];
  }
}

export async function searchAnimeMerged(
  query?: string,
  genre?: string,
  year?: string,
  status?: string,
  format?: string
): Promise<Anime[]> {
  const cacheKey = `anime:search:${query || ""}:${genre || ""}:${year || ""}:${status || ""}:${format || ""}`;
  const cached = apiCache.get<Anime[]>(cacheKey);
  if (cached) return cached;

  try {
    let results = await searchAniList(query, genre, year, status, format, 1, 24);

    if (query && results.length < 5) {
      try {
        const jikanResults = await searchJikanAnime(query);
        const existingTitles = new Set(results.map((r) => r.title.userPreferred.toLowerCase()));
        for (const jikanItem of jikanResults) {
          const title = jikanItem.title.userPreferred.toLowerCase();
          if (!existingTitles.has(title)) {
            results.push(jikanItem);
            existingTitles.add(title);
          }
        }
      } catch (e) {}
    }

    apiCache.set(cacheKey, results, 900);
    return results;
  } catch (err) {
    return [];
  }
}

export async function getAnimeById(id: number | string): Promise<Anime | null> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(numId)) return null;

  const cacheKey = `anime:detail:${numId}`;
  const cached = apiCache.get<Anime>(cacheKey);
  if (cached) return cached;

  let anime = await getAniListDetail(numId);
  if (!anime) {
    anime = await getJikanAnimeDetail(numId);
  }

  if (anime) {
    apiCache.set(cacheKey, anime, 3600);
  }

  return anime;
}

export function determineEpisodeCategory(animeId: number, epNum: number): "canon" | "filler" | "mixed" | "normal" {
  // Bleach (id: 269) - AnimeFillerList Exact Map
  if (animeId === 269) {
    const bleachFiller = [
      33, 50, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 147, 148, 149, 204, 205, 213, 214, 287, 298, 299, 303, 304, 305, 355
    ];
    if (
      bleachFiller.includes(epNum) ||
      (epNum >= 64 && epNum <= 108) ||
      (epNum >= 168 && epNum <= 189) ||
      (epNum >= 228 && epNum <= 266) ||
      (epNum >= 311 && epNum <= 341)
    ) {
      return "filler"; // RED
    }

    const bleachMixed = [
      8, 27, 32, 46, 109, 111, 116, 119, 120, 124, 141, 143, 146, 156, 160, 161, 190, 193, 206, 207, 209, 222, 223, 267, 268, 274, 276, 284, 285, 288, 290, 291, 295, 296, 310, 342, 343, 345, 347, 351, 357
    ];
    if (bleachMixed.includes(epNum)) {
      return "mixed"; // BLUE
    }

    return "normal"; // Manga Canon DEFAULT
  }

  // One Piece (id: 21)
  if (animeId === 21) {
    if ([54,55,56,57,58,59,60,61,98,99,101,102,131,132,133,134,135,136,137,138,139,140,141,142,143,196,197,198,199,200,201,202,203,204,205,206,220,221,222,223,224,225,226,326,327,328,329,330,331,332,333,334,335,336,382,383,384,406,407,426,427,428,429,457,458,492,542,575,576,577,578,590,626,627,628,747,748,749,750,780,781,782,895,896,1029,1030].includes(epNum)) {
      return "filler"; // RED
    }
    if ([1, 45, 46, 47, 68, 69, 100, 291, 292, 303, 405, 459, 493, 494, 574].includes(epNum)) {
      return "mixed"; // BLUE
    }
    return "normal"; // Manga Canon DEFAULT
  }

  // Naruto (id: 20)
  if (animeId === 20) {
    if ((epNum >= 136 && epNum <= 219) || [26, 97, 101, 102, 103, 104, 105, 106].includes(epNum)) {
      return "filler"; // RED
    }
    if ([7, 9, 14, 15, 16, 18, 20, 21, 23, 24, 53, 54, 57, 73, 93, 99, 100].includes(epNum)) {
      return "mixed"; // BLUE
    }
    return "normal"; // Manga Canon DEFAULT
  }

  // Naruto Shippuden (id: 1735)
  if (animeId === 1735) {
    if ([57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,144,145,146,147,148,149,150,151,170,171,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,257,258,259,260,271,279,280,281,284,285,286,287,288,289,290,291,292,293,294,295,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,376,377,388,389,390,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,416,417,422,423,427,428,429,430,431,432,433,434,435,436,437,438,440,441,442,443,444,445,446,447,448,449,450,464,465,466,467,468,480,481,482,483].includes(epNum)) {
      return "filler"; // RED
    }
    if ([9, 10, 11, 12, 19, 24, 55, 72, 89, 115, 127, 128, 213, 378, 385, 386, 391, 392, 393, 414, 415, 418, 421, 426, 469].includes(epNum)) {
      return "mixed"; // BLUE
    }
    return "normal"; // Manga Canon DEFAULT
  }

  return "normal";
}

export async function getAnimeEpisodes(anime: Anime): Promise<Episode[]> {
  const count = anime.releasedEpisodes && anime.releasedEpisodes > 0
    ? anime.releasedEpisodes
    : (anime.episodes && anime.episodes > 0 ? anime.episodes : 12);

  const episodes: Episode[] = [];
  for (let i = 1; i <= Math.min(count, 150); i++) {
    episodes.push({
      number: i,
      title: `Episode ${i}`,
      description: `Episode ${i} of ${anime.title.userPreferred}`,
      thumbnail: anime.bannerImage || anime.coverImage.large,
      category: determineEpisodeCategory(anime.id, i),
    });
  }

  return episodes;
}

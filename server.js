const http = require("http");
const https = require("https");
const url = require("url");
const zlib = require("zlib");

const PORT = process.env.PORT || 3000;
const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const MONGODB_URI = process.env.MONGODB_URI || "";
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || "https://anistream-backend-ljjx.onrender.com";

let mongoClient = null;
let commentsCollection = null;
const memoryCommentsStore = new Map();

if (MONGODB_URI) {
  try {
    const { MongoClient, ObjectId } = require("mongodb");
    mongoClient = new MongoClient(MONGODB_URI);
    mongoClient.connect().then(() => {
      console.log("Connected to MongoDB Atlas successfully!");
      const db = mongoClient.db(process.env.MONGODB_DB_NAME || "anistream");
      commentsCollection = db.collection("comments");
    }).catch(err => {
      console.error("MongoDB Connection Error:", err.message);
    });
  } catch (e) {
    console.warn("mongodb package not loaded. Using persistent fallback store.");
  }
}

// Keep-Alive Self Ping every 14 minutes
setInterval(() => {
  try {
    const pingUrl = `${RENDER_EXTERNAL_URL}/api/keepalive`;
    const lib = pingUrl.startsWith("https") ? https : http;
    lib.get(pingUrl, (res) => {
      console.log(`[KEEP-ALIVE] Ping status: ${res.statusCode}`);
    }).on("error", (err) => {
      console.warn(`[KEEP-ALIVE] Ping error: ${err.message}`);
    });
  } catch (e) {}
}, 840000);

async function getCommentsForAnime(animeId, episode = null) {
  const key = String(animeId);
  const epFilter = episode !== null && episode !== undefined ? parseInt(episode, 10) : null;

  if (commentsCollection) {
    try {
      const query = { animeId: key };
      if (epFilter !== null && !isNaN(epFilter)) {
        query.episode = epFilter;
      }
      const list = await commentsCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(200)
        .toArray();
      return list.map(item => ({
        id: item._id.toString(),
        animeId: item.animeId,
        username: item.username || "Anonymous",
        text: item.text,
        episode: item.episode,
        parentId: item.parentId || null,
        likes: item.likes || 0,
        dislikes: item.dislikes || 0,
        isSpoiler: !!item.isSpoiler,
        timestamp: item.timestamp
      }));
    } catch (e) {
      console.error("MongoDB getComments error:", e);
    }
  }

  const all = memoryCommentsStore.get(key) || [];
  if (epFilter !== null && !isNaN(epFilter)) {
    return all.filter(c => c.episode === epFilter);
  }
  return all;
}

async function saveCommentForAnime(animeId, commentData) {
  const key = String(animeId);
  const comment = {
    animeId: key,
    username: (commentData.username || "Anonymous").trim(),
    text: (commentData.text || "").trim(),
    episode: commentData.episode !== undefined && commentData.episode !== null ? parseInt(commentData.episode, 10) : 0,
    parentId: commentData.parentId || null,
    likes: 0,
    dislikes: 0,
    isSpoiler: !!commentData.isSpoiler,
    timestamp: Date.now()
  };

  if (!comment.text) return null;

  if (commentsCollection) {
    try {
      const res = await commentsCollection.insertOne(comment);
      return {
        id: res.insertedId.toString(),
        ...comment
      };
    } catch (e) {
      console.error("MongoDB saveComment error:", e);
    }
  }

  const list = memoryCommentsStore.get(key) || [];
  comment.id = Math.random().toString(36).substring(2, 9);
  list.unshift(comment);
  memoryCommentsStore.set(key, list.slice(0, 200));
  return comment;
}

async function voteComment(commentId, voteType) {
  if (commentsCollection) {
    try {
      const { ObjectId } = require("mongodb");
      const field = voteType === "like" ? { likes: 1 } : { dislikes: 1 };
      let objId;
      try { objId = new ObjectId(commentId); } catch(e) { objId = commentId; }
      await commentsCollection.updateOne({ _id: objId }, { $inc: field });
      return true;
    } catch (e) {
      console.error("MongoDB voteComment error:", e);
    }
  }

  for (const [key, list] of memoryCommentsStore.entries()) {
    const target = list.find(c => c.id === commentId);
    if (target) {
      if (voteType === "like") target.likes = (target.likes || 0) + 1;
      else target.dislikes = (target.dislikes || 0) + 1;
      return true;
    }
  }
  return false;
}

const FORBIDDEN_KEYWORDS = ["loli", "lolicon", "lolis", "shota", "shotacon", "underage", "child", "kodomo", "lolita", "pico", "boku no pico", "shoujo ramune", "ramune", "chico", "cozo"];
const BLACKLISTED_TITLES = ["boku no pico", "shoujo ramune", "pico to chico", "pico x chico x cozo", "kodomo no jikan", "aki-sora"];

function isForbiddenQuery(query) {
  if (!query) return false;
  const lower = query.toLowerCase();
  return FORBIDDEN_KEYWORDS.some((kw) => lower.includes(kw));
}

function filterSafeMedia(mediaList, allowAdult = false) {
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

const cacheStore = new Map();
function getCache(key) {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return item.data;
}
function setCache(key, data, ttlSeconds = 1800) {
  cacheStore.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

function fetchGraphQL(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query, variables });
    const req = https.request(
      ANILIST_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.errors) reject(new Error(parsed.errors[0]?.message));
            else resolve(parsed.data);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function normalizeAniListMedia(media) {
  const characters = (media.characters?.edges || []).map((edge) => ({
    id: edge.node.id,
    name: edge.node.name?.full || edge.node.name?.userPreferred || "Unknown",
    image: edge.node.image?.large || edge.node.image?.medium,
    role: edge.role || "MAIN",
    voiceActor: edge.voiceActors && edge.voiceActors.length > 0 ? {
      id: edge.voiceActors[0].id,
      name: edge.voiceActors[0].name?.full || edge.voiceActors[0].name?.userPreferred,
      image: edge.voiceActors[0].image?.large || edge.voiceActors[0].image?.medium,
      language: edge.voiceActors[0].languageV2 || "Japanese",
    } : null,
  }));

  const staff = (media.staff?.edges || []).map((edge) => ({
    id: edge.node.id,
    name: edge.node.name?.full || edge.node.name?.userPreferred || "Unknown",
    role: edge.role || "Staff",
    image: edge.node.image?.large || edge.node.image?.medium,
  }));

  const seasons = (media.relations?.edges || [])
    .filter((edge) => edge.node && edge.node.type === "ANIME")
    .map((edge) => ({
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
    title: media.title?.english || media.title?.userPreferred || media.title?.romaji || "Untitled Anime",
    nativeTitle: media.title?.native,
    coverImage: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium,
    bannerImage: media.bannerImage || media.coverImage?.extraLarge,
    synopsis: (media.description || "No synopsis available.").replace(/<[^>]*>?/gm, ""),
    genres: media.genres || [],
    episodes: media.episodes || 24,
    releasedEpisodes: releasedEpisodes && releasedEpisodes > 0 ? releasedEpisodes : (media.episodes || 12),
    rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : "N/A",
    status: media.status || "UNKNOWN",
    year: media.seasonYear || "N/A",
    season: media.season || "",
    studios: (media.studios?.nodes || []).map((s) => s.name),
    format: media.format || "TV",
    characters,
    staff,
    seasons,
  };
}

const MEDIA_QUERY = `
  id
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

function deduplicateList(list) {
  const seen = new Set();
  return list.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function getTrending() {
  const cached = getCache("trending");
  if (cached && cached.length > 0) return cached;
  const q = `query { Page(page: 1, perPage: 18) { media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_QUERY} } } }`;
  const data = await fetchGraphQL(q);
  const safeList = filterSafeMedia(data.Page.media || [], false);
  const list = deduplicateList(safeList.map(normalizeAniListMedia));
  if (list && list.length > 0) setCache("trending", list);
  return list;
}

async function getPopular() {
  const cached = getCache("popular");
  if (cached && cached.length > 0) return cached;
  const q = `query { Page(page: 1, perPage: 18) { media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_QUERY} } } }`;
  const data = await fetchGraphQL(q);
  const safeList = filterSafeMedia(data.Page.media || [], false);
  const list = deduplicateList(safeList.map(normalizeAniListMedia));
  if (list && list.length > 0) setCache("popular", list);
  return list;
}

async function searchAnime(search, genre, year, status, format, page = 1) {
  const cacheKey = `search:${search}:${genre}:${year}:${status}:${format}:${page}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const vars = { page };
  let varDefs = ["$page: Int"];
  let mediaArgs = ["type: ANIME", "isAdult: false", "sort: POPULARITY_DESC"];

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

  const q = `
    query (${varDefs.join(", ")}) {
      Page(page: $page, perPage: 30) {
        media(${mediaArgs.join(", ")}) {
          ${MEDIA_QUERY}
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL(q, vars);
    const safeList = filterSafeMedia(data.Page.media || [], false);
    const list = deduplicateList(safeList.map(normalizeAniListMedia));
    if (list && list.length > 0) setCache(cacheKey, list, 900);
    return list;
  } catch (e) {
    console.error("Search query error:", e);
    return [];
  }
}

async function getAnimeDetail(id) {
  const cacheKey = `detail:${id}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const q = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_QUERY}
        relations {
          edges {
            relationType
            node { id type title { romaji english userPreferred } format seasonYear coverImage { large medium } }
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
    const data = await fetchGraphQL(q, { id: parseInt(id, 10) });
    if (!data.Media) return null;
    const isSafe = filterSafeMedia([data.Media], false).length > 0;
    if (!isSafe) return null;
    const result = normalizeAniListMedia(data.Media);
    if (result) setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error("getAnimeDetail error:", e);
    return null;
  }
}

function sendCompressedResponse(req, res, statusCode, headers, bodyData) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const buffer = Buffer.isBuffer(bodyData) ? bodyData : Buffer.from(bodyData);

  headers['Access-Control-Allow-Origin'] = '*';
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Accept-Encoding';
  headers['Vary'] = 'Accept-Encoding';

  if (acceptEncoding.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    zlib.gzip(buffer, (err, compressed) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Compression error');
        return;
      }
      headers['Content-Length'] = compressed.length;
      res.writeHead(statusCode, headers);
      res.end(compressed);
    });
  } else if (acceptEncoding.includes('deflate')) {
    headers['Content-Encoding'] = 'deflate';
    zlib.deflate(buffer, (err, compressed) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Compression error');
        return;
      }
      headers['Content-Length'] = compressed.length;
      res.writeHead(statusCode, headers);
      res.end(compressed);
    });
  } else {
    headers['Content-Length'] = buffer.length;
    res.writeHead(statusCode, headers);
    res.end(buffer);
  }
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Accept-Encoding");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (pathname === "/api/keepalive" || pathname === "/api/ping") {
      const payload = JSON.stringify({ success: true, status: "alive", timestamp: Date.now() });
      sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
      return;
    }

    if (pathname === "/api/anime/trending") {
      const list = await getTrending();
      const payload = JSON.stringify({ success: true, data: list });
      sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
      return;
    }

    if (pathname === "/api/anime/popular") {
      const list = await getPopular();
      const payload = JSON.stringify({ success: true, data: list });
      sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
      return;
    }

    if (pathname === "/api/anime/search") {
      const q = parsedUrl.query.q || "";
      if (isForbiddenQuery(q)) {
        const payload = JSON.stringify({
          success: false,
          forbidden: true,
          error: "WARNING: Content violating safety policies (including loli/shota/underage content) is strictly prohibited and not tolerated on this platform."
        });
        sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
        return;
      }

      const genre = parsedUrl.query.genre || "";
      const year = parsedUrl.query.year || "";
      const status = parsedUrl.query.status || "";
      const format = parsedUrl.query.format || "";
      const page = parseInt(parsedUrl.query.page || 1, 10);
      const list = await searchAnime(q, genre, year, status, format, page);
      const payload = JSON.stringify({ success: true, count: list.length, page, data: list });
      sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
      return;
    }

    if (pathname.includes("/vote")) {
      const parts = pathname.split("/").filter(Boolean);
      const commentId = parts[2];
      const body = await parseRequestBody(req);
      const success = await voteComment(commentId, body.type);
      const payload = JSON.stringify({ success });
      sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
      return;
    }

    if (pathname.includes("/comments")) {
      const parts = pathname.split("/").filter(Boolean);
      const animeId = parts[2];

      if (req.method === "GET") {
        const ep = parsedUrl.query.episode;
        const comments = await getCommentsForAnime(animeId, ep);
        const payload = JSON.stringify({ success: true, data: comments });
        sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
        return;
      }

      if (req.method === "POST") {
        const body = await parseRequestBody(req);
        const saved = await saveCommentForAnime(animeId, body);
        if (!saved) {
          const payload = JSON.stringify({ success: false, error: "Comment text cannot be empty" });
          sendCompressedResponse(req, res, 400, { "Content-Type": "application/json" }, payload);
          return;
        }
        const payload = JSON.stringify({ success: true, data: saved });
        sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
        return;
      }
    }

    if (pathname.startsWith("/api/anime/")) {
      const parts = pathname.split("/").filter(Boolean);
      const animeId = parts[2];
      const anime = await getAnimeDetail(animeId);
      if (!anime) {
        const payload = JSON.stringify({ success: false, error: "Not found or prohibited" });
        sendCompressedResponse(req, res, 404, { "Content-Type": "application/json" }, payload);
        return;
      }
      const payload = JSON.stringify({ success: true, data: anime });
      sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
      return;
    }

    const payload = JSON.stringify({ success: true, status: "ANISTREAM API Active" });
    sendCompressedResponse(req, res, 200, { "Content-Type": "application/json" }, payload);
  } catch (error) {
    console.error("Server error:", error);
    const payload = JSON.stringify({ success: false, error: "Internal Server Error" });
    sendCompressedResponse(req, res, 500, { "Content-Type": "application/json" }, payload);
  }
});

server.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`  ANISTREAM ADVANCED COMMENTS BACKEND LIVE ON PORT ${PORT}!`);
  console.log(`================================================`);
});

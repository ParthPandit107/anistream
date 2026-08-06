# AniStream — Minimalist Anime Discovery & Streaming Shell

AniStream is a high-performance, minimalist, black-and-white anime discovery and streaming-shell web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **AniList GraphQL API**, and **Jikan MAL API**.

---

## 🌟 Key Features

- **Strict Monochrome Aesthetic**: Pure black (`#000000`) and dark surface styling, crisp typography, and grayscale imagery filters.
- **Metadata Proxy Backend**: Merges and normalizes data from **AniList GraphQL** and **Jikan (MyAnimeList v4)** with LRU response caching and rate-limit exponential backoff.
- **Dedicated Anime & Streaming Pages**: Every anime has a dedicated details page (`/anime/[id]`) and dedicated streaming page (`/watch/[id]/[episode]`) featuring:
  - Animation Studio & Production Staff (Directors, Composers, Original Authors).
  - Character & Japanese Voice Actor (VA / Seiyuu) roster with roles.
  - Interactive Episode Grid with watched status indicators.
- **Modular Video Source Architecture**: Custom `EMBED_PROVIDERS` interface with 4 pre-configured servers (Megaplay, Vidnest Animepahe, Vidnest Anime, Tryembed), SUB/DUB selector, and fallback placeholder states.
- **Graceful Auto-Scroll-To-Top**: Every tab switch, link click, or route change smoothly scrolls up to top (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
- **Live Search & Filter**: Instant debounced search with genre, status, format, and year filter selectors.
- **SEO & Performance**: Dynamic OpenGraph tags, JSON-LD Schema.org (`TVSeries`/`Movie`), `sitemap.xml`, `robots.txt`, and ISR cache revalidation.

---

## 🛠️ Project Architecture

```
anistream/
├── app/
│   ├── layout.tsx                // Root layout with WatchProvider, Navbar, MobileNav, Footer
│   ├── page.tsx                  // Home page: Hero Carousel & AnimeRows (RSC)
│   ├── globals.css               // Strict Black & White design tokens & grayscale filters
│   ├── search/
│   │   └── page.tsx              // Live debounced catalog search with filters
│   ├── anime/
│   │   └── [id]/
│   │       └── page.tsx          // Dedicated detail page with creators, staff & VA roster
│   ├── watch/
│   │   └── [id]/
│   │       └── [episode]/
│   │           └── page.tsx      // Dedicated watch page with Video Player, Server selector & SUB/DUB
│   ├── api/
│   │   ├── anime/
│   │   │   ├── trending/route.ts
│   │   │   ├── popular/route.ts
│   │   │   ├── search/route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/episodes/route.ts
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── Navbar.tsx                // Header with logo, search, and navigation links
│   ├── MobileNav.tsx             // Mobile bottom navigation bar
│   ├── HeroCarousel.tsx          // Interactive hero banner
│   ├── AnimeCard.tsx             // Grayscale anime card
│   ├── AnimeRow.tsx              // Horizontal scrolling carousel row
│   ├── SearchBar.tsx             // Debounced input bar
│   ├── GenreFilter.tsx           // Genre & metadata filter pills/dropdowns
│   ├── EpisodeList.tsx           // Episode selector grid
│   ├── CharacterVARoster.tsx     // Character & Voice Actor (VA) grid
│   ├── StaffCreatorsList.tsx     // Production staff & studio breakdown
│   ├── VideoPlayer.tsx           // Video player wrapper with missing source state
│   └── ServerSelector.tsx        // Server 1-4 tabs & SUB/DUB toggle
├── lib/
│   ├── api/
│   │   ├── anilist.ts            // AniList GraphQL client
│   │   ├── jikan.ts              // Jikan REST client
│   │   └── merged.ts             // Merging & deduplication engine
│   ├── video-sources.ts          // EMBED_PROVIDERS array & stream resolver
│   ├── cache.ts                  // LRU in-memory cache & retry handler
│   ├── types.ts                  // TypeScript schema interfaces
│   └── utils.ts                  // Debounce, text truncate, class joiners
└── context/
    └── WatchContext.tsx          // Watch history, SUB/DUB & server state provider
```

---

## 🚀 Quick Setup & Installation

### 1. Install Dependencies
```bash
cd C:\Users\HP\Desktop\anistream
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📺 Configuring Video Sources

Video sources are defined in `lib/video-sources.ts`.

The included servers are:
- **Server 1 (Megaplay)**: `https://megaplay.buzz/stream/ani/${id}/${ep}/${audio}`
- **Server 2 (Vidnest Animepahe)**: `https://vidnest.fun/animepahe/${id}/${ep}/${audio}`
- **Server 3 (Vidnest Anime)**: `https://vidnest.fun/anime/${id}/${ep}/${audio}`
- **Server 4 (Tryembed)**: `https://tryembed.us.cc/embed/anime/${id}/${ep}/${audio}`

To add or customize streaming servers:
1. Open `lib/video-sources.ts`.
2. Update or add objects to the `EMBED_PROVIDERS` array conforming to the `EmbedProvider` interface.

---

## 📄 License

Created for educational purposes & anime discovery.

import type { Metadata } from "next";
import "./globals.css";
import { WatchProvider } from "@/context/WatchContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "AniStream — Minimalist Anime Discovery & Streaming Shell",
  description: "A minimalist, black-and-white anime discovery and streaming platform powered by AniList & MyAnimeList API proxy.",
  keywords: ["Anime", "Streaming", "Minimalist", "AniList", "MyAnimeList", "Manga", "Japanese Animation"],
  authors: [{ name: "AniStream Team" }],
  openGraph: {
    title: "AniStream — Minimalist Anime Discovery",
    description: "Discover and stream anime with a clean, typography-led monochrome interface.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">
        <WatchProvider>
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
        </WatchProvider>
      </body>
    </html>
  );
}

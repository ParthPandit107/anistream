import { NextRequest, NextResponse } from "next/server";
import { getAnimeById, getAnimeEpisodes } from "@/lib/api/merged";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const anime = await getAnimeById(id);
    if (!anime) {
      return NextResponse.json({ success: false, error: "Anime not found" }, { status: 404 });
    }
    const episodes = await getAnimeEpisodes(anime);
    return NextResponse.json({ success: true, count: episodes.length, data: episodes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch episode list" },
      { status: 500 }
    );
  }
}

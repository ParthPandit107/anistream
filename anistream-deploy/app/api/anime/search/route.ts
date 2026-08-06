import { NextResponse } from "next/server";
import { searchAnime, isForbiddenQuery } from "@/lib/anilist";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const genre = searchParams.get("genre") || "";
    const year = searchParams.get("year") || "";
    const status = searchParams.get("status") || "";
    const format = searchParams.get("format") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (isForbiddenQuery(query)) {
      return NextResponse.json({
        success: false,
        forbidden: true,
        error:
          "WARNING: Content violating safety policies (including loli/shota/underage content) is strictly prohibited and not tolerated on this platform.",
      });
    }

    const results = await searchAnime(query, genre, year, status, format, page);

    return NextResponse.json({
      success: true,
      count: results.length,
      page,
      data: results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to search anime catalog" },
      { status: 500 }
    );
  }
}

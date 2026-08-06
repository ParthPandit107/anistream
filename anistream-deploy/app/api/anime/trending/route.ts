import { NextResponse } from "next/server";
import { getTrendingAnime } from "@/lib/api/merged";

export async function GET() {
  try {
    const list = await getTrendingAnime();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch trending anime" },
      { status: 500 }
    );
  }
}

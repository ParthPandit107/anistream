import { NextResponse } from "next/server";
import { getPopularAnime } from "@/lib/api/merged";

export async function GET() {
  try {
    const list = await getPopularAnime();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch popular anime" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { getFeedPosts } from "@/server/data/post";
import { getCurrentUserId } from "@/server/session";
import { parseFeedKind } from "@/types/feed";

export async function GET(request: Request) {
  try {
    // The feed is viewer-relative now (whose posts, and which of them the
    // viewer liked, saved or follows), so it needs a session rather than
    // handing the same rows to everyone.
    const viewerId = await getCurrentUserId();
    if (!viewerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsedSkip = Number.parseInt(searchParams.get("skip") || "0", 10);
    const skip = Number.isFinite(parsedSkip) && parsedSkip > 0 ? parsedSkip : 0;
    const feed = parseFeedKind(searchParams.get("feed")) ?? "latest";

    const posts = await getFeedPosts({ viewerId, feed, skip, take: 10 });
    return NextResponse.json(posts);
  } catch (err: unknown) {
    console.error("API /api/post error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

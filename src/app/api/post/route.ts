import { NextResponse } from 'next/server';
import { getAllPost } from '@/server/data/post';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const sortParam = searchParams.get('sort');
    const sort = sortParam === 'trending' ? 'trending' : 'chronological';
    const posts = await getAllPost(skip, 10, sort);
    return NextResponse.json(posts);
  } catch (err: unknown) {
    console.error("API /api/post error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
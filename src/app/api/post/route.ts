import { NextResponse } from 'next/server';
import { getAllPost } from '@/actions/post.action';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get('skip') || '0');
  const posts = await getAllPost(skip, 10);
  return NextResponse.json(posts);
}
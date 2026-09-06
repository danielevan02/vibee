/**
 * Read-side data access for post.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
import "server-only";

import { prisma } from "@/db";

export async function getAllPost(
  skip = 0,
  take = 10,
  sort: "chronological" | "trending" = "chronological"
) {
  try {
    return await prisma.post.findMany({
      skip,
      take,
      include: {
        author: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: {
            authorId: true,
          },
        },
        bookmarks: {
          select: {
            userId: true,
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: true,
            replies: {
              include: { author: true },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy:
        sort === "trending"
          ? [
              { likes: { _count: "desc" } },
              { comments: { _count: "desc" } },
              { createdAt: "desc" },
            ]
          : { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getAllPost error:", error);
    return [];
  }
}

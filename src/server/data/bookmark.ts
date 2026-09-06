/**
 * Read-side data access for bookmark.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
"use server";

import { prisma } from "@/db";
import { onAuthenticateUser } from "@/server/data/user";

export async function getUserBookmarks(skip = 0, take = 20) {
  try {
    const { user } = await onAuthenticateUser();

    if (!user) {
      return {
        status: 401,
        message: "You're not authenticated!",
        posts: [],
      };
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: {
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
        },
      },
    });

    const posts = bookmarks.map((b) => b.post);

    return {
      status: 200,
      posts,
    };
  } catch (error) {
    console.error("getUserBookmarks error:", error);
    return {
      status: 500,
      message: "Internal Server Error",
      posts: [],
    };
  }
}

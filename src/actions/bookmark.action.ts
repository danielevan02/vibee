"use server";

import { prisma } from "@/db";
import { onAuthenticateUser } from "./user.action";

export async function toggleBookmark(postId: string) {
  try {
    const { user } = await onAuthenticateUser();

    if (!user) {
      return {
        status: 401,
        message: "You're not authenticated!",
        isBookmarked: false,
      };
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });

      return {
        status: 200,
        isBookmarked: false,
        message: "Removed from bookmarks",
      };
    } else {
      // Create bookmark
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          postId,
        },
      });

      return {
        status: 200,
        isBookmarked: true,
        message: "Saved to bookmarks",
      };
    }
  } catch (error) {
    console.error("toggleBookmark error:", error);
    return {
      status: 500,
      message: "Failed to update bookmark",
      isBookmarked: false,
    };
  }
}

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

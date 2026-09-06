"use server";

"use server";

import { prisma } from "@/db";
import { onAuthenticateUser } from "@/server/data/user";

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

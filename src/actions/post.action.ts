"use server";

import { prisma } from "@/lib/prisma";
import { onAuthenticateUser } from "./user.action";

export async function createPost({
  content,
  imageUrl,
  imageUrls,
}: {
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
}) {
  try {
    const { user } = await onAuthenticateUser();

    if(!user){
      return {
        status: 401,
        message: "You're not authenticated!"
      }
    }

    const finalImageUrls = imageUrls && imageUrls.length > 0
      ? imageUrls
      : (imageUrl ? [imageUrl] : []);
    const primaryImageUrl = finalImageUrls[0] || null;

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: primaryImageUrl,
        imageUrls: finalImageUrls,
        author: {
          connect: {
            id: user.id
          }
        },
      },
      include: {
        author: true,
        _count: {
          select: {
            comments: true,
            likes: true
          }
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
        likes: {
          select: {
            authorId: true
          }
        },
        bookmarks: {
          select: {
            userId: true
          }
        }
      }
    });

    // Parse @mentions and notify mentioned users
    if (content) {
      const mentionMatches = content.match(/@([a-zA-Z0-9_]+)/g);
      if (mentionMatches && mentionMatches.length > 0) {
        const usernames = Array.from(
          new Set(mentionMatches.map((m) => m.replace("@", "").toLowerCase()))
        );

        const mentionedUsers = await prisma.user.findMany({
          where: {
            username: {
              in: usernames,
              mode: "insensitive",
            },
            id: {
              not: user.id, // Don't notify oneself
            },
          },
          select: {
            id: true,
          },
        });

        if (mentionedUsers.length > 0) {
          await prisma.notification.createMany({
            data: mentionedUsers.map((mUser) => ({
              type: "MENTION",
              content: content.slice(0, 140),
              recipientId: mUser.id,
              senderId: user.id,
              postId: post.id,
            })),
          });
        }
      }
    }

    return {
      status: 201,
      message: "Post Created!",
      post
    }
  } catch (error) {
    console.error("createPost error:", error);
    return {
      status: 500,
      message: "Internal Server Error"
    }
  }
}

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

export async function deletePost(postId: string) {
  try {
    const { user } = await onAuthenticateUser();

    if (!user) {
      return {
        status: 401,
        message: "You're not authenticated!",
      };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return {
        status: 404,
        message: "Post not found",
      };
    }

    if (post.authorId !== user.id) {
      return {
        status: 403,
        message: "You are not authorized to delete this post",
      };
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return {
      status: 200,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("deletePost error:", error);
    return {
      status: 500,
      message: "Failed to delete post",
    };
  }
}
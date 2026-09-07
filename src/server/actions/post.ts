"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/db";
import {
  createPostSchema,
  postIdSchema,
  updatePostSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from "@/lib/validations/post";
import { getCurrentUserId } from "@/server/session";
import type { ActionResult } from "@/types/action";
import type { Comment, Post, User } from "@/db/schema";

/** What `createPost` hands back: the new post shaped like a feed row, so the
 *  client can prepend it without a refetch. */
type CreatedPost = Post & {
  author: User;
  _count: { comments: number; likes: number };
  comments: (Comment & { author: User; replies: (Comment & { author: User })[] })[];
  likes: { authorId: string }[];
  bookmarks: { userId: string }[];
};

export async function createPost(
  input: CreatePostInput,
): Promise<ActionResult<CreatedPost>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };
  const { content, imageUrl, imageUrls } = parsed.data;

  try {

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
            id: userId
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
              not: userId, // Don't notify oneself
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
              senderId: userId,
              postId: post.id,
            })),
          });
        }
      }
    }

    revalidatePath("/home");
    return { ok: true, data: post };
  } catch (error) {
    console.error("createPost:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function updatePost(
  input: UpdatePostInput,
): Promise<ActionResult<{ content: string; updatedAt: Date }>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };
  const { postId, content } = parsed.data;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return { ok: false, error: "not_found" };
    // Ownership is decided here, not by whether the UI drew the button.
    if (post.authorId !== userId) return { ok: false, error: "forbidden" };

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { content },
      select: { content: true, updatedAt: true },
    });

    revalidatePath("/home");
    revalidatePath(`/post/${postId}`);

    return { ok: true, data: { content: updated.content ?? "", updatedAt: updated.updatedAt } };
  } catch (error) {
    console.error("updatePost:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = postIdSchema.safeParse(postId);
  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    const post = await prisma.post.findUnique({
      where: { id: parsed.data },
      select: { authorId: true },
    });

    if (!post) return { ok: false, error: "not_found" };
    // Ownership is checked on the server; the UI only hides the button.
    if (post.authorId !== userId) return { ok: false, error: "forbidden" };

    await prisma.post.delete({ where: { id: parsed.data } });
    revalidatePath("/home");

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("deletePost:", error);
    return { ok: false, error: "unknown" };
  }
}

"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/db";
import { commentIdSchema, createCommentSchema, type CreateCommentInput } from "@/lib/validations/comment";
import { isNotFound, isUniqueViolation } from "@/lib/db-errors";
import { getCurrentUserId } from "@/server/session";
import type { ActionResult } from "@/types/action";
import type { Comment, User } from "@/db/schema";

type CreatedComment = Comment & { author: User };

export async function createComment(
  input: CreateCommentInput,
): Promise<ActionResult<CreatedComment>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };
  const { content, postId, parentId } = parsed.data;

  try {

    // Single-level threading. If someone replies to a reply, the new comment is
    // attached to that reply's parent instead of nesting deeper. The check lives
    // here rather than in the UI so the depth invariant holds for every caller.
    let resolvedParentId: string | null = null;
    let parentAuthorId: string | null = null;

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true, postId: true, authorId: true },
      });

      if (!parent || parent.postId !== postId) {
        return { ok: false, error: "not_found" };
      }

      resolvedParentId = parent.parentId ?? parent.id;
      parentAuthorId = parent.authorId;
    }

    const comment = await prisma.comment.create({
      data: {
        authorId: userId,
        content,
        postId,
        parentId: resolvedParentId,
      },
      include: {
        author: true
      }
    });

    // Parse @mentions in comment and notify mentioned users
    if (content) {
      const mentionMatches = content.match(/@([a-zA-Z0-9_]+)/g);
      const mentionedUsernames = mentionMatches
        ? Array.from(
            new Set(mentionMatches.map((m) => m.replace("@", "").toLowerCase()))
          )
        : [];

      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await prisma.user.findMany({
          where: {
            username: {
              in: mentionedUsernames,
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
              postId: postId,
            })),
          });
        }
      }

      // Notify the post author, and - for a reply - whoever is being replied
      // to. Skip either if it would notify the actor, or the same person twice.
      const targetPost = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });

      const recipients = new Set<string>();
      if (targetPost && targetPost.authorId !== userId) {
        recipients.add(targetPost.authorId);
      }
      if (parentAuthorId && parentAuthorId !== userId) {
        recipients.add(parentAuthorId);
      }

      if (recipients.size > 0) {
        await prisma.notification.createMany({
          data: Array.from(recipients).map((recipientId) => ({
            type: "COMMENT" as const,
            content: content.slice(0, 140),
            recipientId,
            senderId: userId,
            postId: postId,
          })),
        });
      }
    }

    revalidatePath('/home');

    return { ok: true, data: comment };
  } catch (error) {
    console.error("createComment:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function toggleCommentLike(
  commentId: string,
): Promise<ActionResult<{ isLiked: boolean; likeCount: number }>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = commentIdSchema.safeParse(commentId);
  if (!parsed.success) return { ok: false, error: "validation" };
  const id = parsed.data;

  try {
    const existing = await prisma.commentLike.findUnique({
      where: { authorId_commentId: { authorId: userId, commentId: id } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentLike.create({ data: { authorId: userId, commentId: id } });
    }

    revalidatePath("/home");
    // Read the count back rather than adjusting a number the client guessed,
    // so two tabs cannot drift apart.
    return { ok: true, data: await readLikeState(id, userId) };
  } catch (error) {
    // Two clicks racing through the optimistic UI is not a failure - whichever
    // one lost, the database now holds the answer, so just report it.
    if (isUniqueViolation(error) || isNotFound(error)) {
      return { ok: true, data: await readLikeState(id, userId) };
    }
    console.error("toggleCommentLike:", error);
    return { ok: false, error: "unknown" };
  }
}

async function readLikeState(commentId: string, userId: string) {
  const [likeCount, mine] = await Promise.all([
    prisma.commentLike.count({ where: { commentId } }),
    prisma.commentLike.findUnique({
      where: { authorId_commentId: { authorId: userId, commentId } },
      select: { id: true },
    }),
  ]);
  return { isLiked: !!mine, likeCount };
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = commentIdSchema.safeParse(commentId);
  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parsed.data },
      select: { authorId: true, post: { select: { authorId: true } } },
    });

    if (!comment) return { ok: false, error: "not_found" };

    // Either the person who wrote it or the owner of the thread may remove it.
    const mayDelete =
      comment.authorId === userId || comment.post.authorId === userId;
    if (!mayDelete) return { ok: false, error: "forbidden" };

    // Replies cascade in the schema, so a top-level comment takes its thread.
    await prisma.comment.delete({ where: { id: parsed.data } });

    revalidatePath("/home");
    return { ok: true, data: undefined };
  } catch (error) {
    if (isNotFound(error)) return { ok: false, error: "not_found" };
    console.error("deleteComment:", error);
    return { ok: false, error: "unknown" };
  }
}

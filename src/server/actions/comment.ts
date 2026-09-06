"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/db";
import { createCommentSchema, type CreateCommentInput } from "@/lib/validations/comment";
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

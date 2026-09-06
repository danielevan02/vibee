"use server"

import { prisma } from "@/db"
import { onAuthenticateUser } from "./user.action"
import { revalidatePath } from "next/cache";

export async function createComment({
  content,
  postId,
  parentId,
}: {
  content: string;
  postId: string;
  parentId?: string | null;
}) {
  try {
    const { user } = await onAuthenticateUser()
    if(!user){
      return {
        status: 401,
        message: "You're not authenticated"
      }
    }

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
        return { status: 404, message: "The comment you replied to no longer exists" };
      }

      resolvedParentId = parent.parentId ?? parent.id;
      parentAuthorId = parent.authorId;
    }

    const comment = await prisma.comment.create({
      data: {
        authorId: user.id,
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
      if (targetPost && targetPost.authorId !== user.id) {
        recipients.add(targetPost.authorId);
      }
      if (parentAuthorId && parentAuthorId !== user.id) {
        recipients.add(parentAuthorId);
      }

      if (recipients.size > 0) {
        await prisma.notification.createMany({
          data: Array.from(recipients).map((recipientId) => ({
            type: "COMMENT" as const,
            content: content.slice(0, 140),
            recipientId,
            senderId: user.id,
            postId: postId,
          })),
        });
      }
    }

    revalidatePath('/home');

    return {
      status: 201,
      message: "Comment Posted!",
      comment
    }
  } catch (error) {
    console.error("createComment error:", error);
    return {
      status: 500,
      message: "Internal Server Error"
    }
  }
}
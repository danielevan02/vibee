"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/db";
import { isNotFound, isUniqueViolation } from "@/lib/db-errors";
import { postIdSchema } from "@/lib/validations/post";
import { getCurrentUserId } from "@/server/session";
import type { ActionResult } from "@/types/action";

export async function createLike(input: { postId: string }): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = postIdSchema.safeParse(input.postId);
  if (!parsed.success) return { ok: false, error: "validation" };
  const postId = parsed.data;

  try {
    await prisma.like.create({ data: { authorId: userId, postId } });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, content: true },
    });

    if (post && post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          content: post.content?.slice(0, 100) || "your vibe",
          recipientId: post.authorId,
          senderId: userId,
          postId,
        },
      });
    }

    revalidatePath("/home");
    return { ok: true, data: undefined };
  } catch (error) {
    // Liking twice races through the optimistic UI; treat it as already-liked
    // rather than a server error.
    if (isUniqueViolation(error)) return { ok: true, data: undefined };
    console.error("createLike:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function removeLike(input: { postId: string }): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = postIdSchema.safeParse(input.postId);
  if (!parsed.success) return { ok: false, error: "validation" };
  const postId = parsed.data;

  try {
    await prisma.like.delete({
      where: { authorId_postId: { authorId: userId, postId } },
    });

    // Drop the notification too, but only while it is still unread.
    await prisma.notification.deleteMany({
      where: { type: "LIKE", senderId: userId, postId, read: false },
    });

    revalidatePath("/home");
    return { ok: true, data: undefined };
  } catch (error) {
    if (isNotFound(error)) return { ok: true, data: undefined };
    console.error("removeLike:", error);
    return { ok: false, error: "unknown" };
  }
}

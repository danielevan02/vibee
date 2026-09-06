"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/db";
import { postIdSchema } from "@/lib/validations/post";
import { getCurrentUserId } from "@/server/session";
import type { ActionResult } from "@/types/action";

export async function toggleBookmark(
  postId: string,
): Promise<ActionResult<{ isBookmarked: boolean }>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = postIdSchema.safeParse(postId);
  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId: parsed.data } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      revalidatePath("/bookmarks");
      return { ok: true, data: { isBookmarked: false } };
    }

    await prisma.bookmark.create({ data: { userId, postId: parsed.data } });
    revalidatePath("/bookmarks");
    return { ok: true, data: { isBookmarked: true } };
  } catch (error) {
    console.error("toggleBookmark:", error);
    return { ok: false, error: "unknown" };
  }
}

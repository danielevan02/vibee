"use server";

import { prisma } from "@/db";
import { isUniqueViolation } from "@/lib/db-errors";
import { createReportSchema, type CreateReportInput } from "@/lib/validations/report";
import { getCurrentUserId } from "@/server/session";
import type { ActionResult } from "@/types/action";

export async function createReport(
  input: CreateReportInput,
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = createReportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };
  const { postId, reason, details } = parsed.data;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return { ok: false, error: "not_found" };
    if (post.authorId === userId) return { ok: false, error: "forbidden" };

    await prisma.report.create({
      data: { reporterId: userId, postId, reason, details: details || null },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    // A second report from the same user hits the unique constraint; that is a
    // conflict, not a failure, and the caller shows a distinct message.
    if (isUniqueViolation(error)) return { ok: false, error: "conflict" };
    console.error("createReport:", error);
    return { ok: false, error: "unknown" };
  }
}

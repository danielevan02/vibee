"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/db";
import { isUniqueViolation } from "@/lib/db-errors";
import {
  createReportSchema,
  updateReportStatusSchema,
  type CreateReportInput,
  type UpdateReportStatusInput,
} from "@/lib/validations/report";
import { getCurrentUserId, requireAdmin } from "@/server/session";
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

/**
 * Move a report through the moderation queue.
 *
 * Reports used to be write-only: the row was created and its status sat at
 * PENDING forever because nothing could change it. This is the other half.
 */
export async function updateReportStatus(
  input: UpdateReportStatusInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "forbidden" };

  const parsed = updateReportStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    const { count } = await prisma.report.updateMany({
      where: { id: parsed.data.reportId },
      data: { status: parsed.data.status },
    });

    if (count === 0) return { ok: false, error: "not_found" };

    revalidatePath("/admin/reports");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("updateReportStatus:", error);
    return { ok: false, error: "unknown" };
  }
}

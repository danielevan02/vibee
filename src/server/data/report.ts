/**
 * Read-side data access for report.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
import "server-only";

import { prisma } from "@/db";
import type { ReportStatus } from "@/lib/validations/report";

/**
 * The moderation queue, newest first.
 *
 * Callers are expected to have checked `requireAdmin` already - this is a
 * query, not a gate.
 */
export async function getReports(status?: ReportStatus) {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: {
        select: { id: true, name: true, username: true, photo: true },
      },
      post: {
        select: {
          id: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          author: {
            select: { id: true, name: true, username: true, photo: true },
          },
        },
      },
    },
  });
}

/** How many reports sit in each status, for the queue's filter chips. */
export async function getReportCounts() {
  const rows = await prisma.report.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});
}

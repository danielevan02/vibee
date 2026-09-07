import { notFound } from "next/navigation";

import ReportQueue from "@/components/features/admin/report-queue";
import { getReportCounts, getReports } from "@/server/data/report";
import { requireAdmin } from "@/server/session";
import { REPORT_STATUSES, type ReportStatus } from "@/lib/validations/report";

/**
 * The moderation queue.
 *
 * Reports were write-only until now: `createReport` inserted a row and nothing
 * in the app could ever read or resolve it, so every report sat at PENDING
 * while the report dialog promised a "moderation team".
 */
export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAdmin();
  // Not a redirect: someone who is not a moderator should not learn that this
  // address exists.
  if (!admin) notFound();

  const { status: raw } = await searchParams;
  const status = (REPORT_STATUSES as readonly string[]).includes(raw ?? "")
    ? (raw as ReportStatus)
    : undefined;

  const [reports, counts] = await Promise.all([
    getReports(status),
    getReportCounts(),
  ]);

  return (
    <ReportQueue
      key={status ?? "all"}
      reports={reports as never}
      counts={counts}
      status={status}
    />
  );
}

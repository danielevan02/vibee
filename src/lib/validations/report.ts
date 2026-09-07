import { z } from "zod";

export const REPORT_REASONS = [
  "spam",
  "harassment",
  "misinformation",
  "nudity",
  "violence",
  "other",
] as const;

export const createReportSchema = z.object({
  postId: z.uuid(),
  // Previously a free-form string, so any value at all reached the database.
  reason: z.string().trim().min(1).max(64),
  details: z.string().trim().max(1000).optional(),
});

/** Where a report can sit in the moderation queue. */
export const REPORT_STATUSES = ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const updateReportStatusSchema = z.object({
  reportId: z.uuid(),
  status: z.enum(REPORT_STATUSES),
});

export type UpdateReportStatusInput = z.input<typeof updateReportStatusSchema>;

export type CreateReportInput = z.input<typeof createReportSchema>;

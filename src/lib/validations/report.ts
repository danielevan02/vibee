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

export type CreateReportInput = z.input<typeof createReportSchema>;

import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(300).optional(),
  website: z.union([z.url(), z.literal("")]).optional(),
  location: z.string().trim().max(80).optional(),
});

export const userIdSchema = z.string().min(1);

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;

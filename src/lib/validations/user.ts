import { z } from "zod";

/**
 * `undefined` leaves a field alone; for the two images, `null` clears it.
 * That three-way distinction is what lets one action serve "renamed",
 * "picked a new avatar" and "removed my cover" without separate endpoints.
 */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(300).optional(),
  website: z.union([z.url(), z.literal("")]).optional(),
  location: z.string().trim().max(80).optional(),
  photo: z.url().nullable().optional(),
  coverImage: z.url().nullable().optional(),
});

export const userIdSchema = z.string().min(1);

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;

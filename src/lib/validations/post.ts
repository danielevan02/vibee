import { z } from "zod";

import { WORD_LIMIT } from "@/config/constants";

export const createPostSchema = z
  .object({
    content: z.string().trim().max(WORD_LIMIT).optional().default(""),
    imageUrl: z.url().optional(),
    imageUrls: z.array(z.url()).max(4).optional(),
  })
  // A post needs at least one of the two, which the old signature allowed to be
  // empty on both sides.
  .refine((v) => v.content.length > 0 || (v.imageUrls?.length ?? 0) > 0 || !!v.imageUrl, {
    message: "A post needs text or at least one image",
  });

export const postIdSchema = z.uuid();

export type CreatePostInput = z.input<typeof createPostSchema>;

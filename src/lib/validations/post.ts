import { z } from "zod";

import { MAX_POST_IMAGES, POST_CHAR_LIMIT } from "@/config/constants";

export const createPostSchema = z
  .object({
    content: z.string().trim().max(POST_CHAR_LIMIT).optional().default(""),
    imageUrl: z.url().optional(),
    imageUrls: z.array(z.url()).max(MAX_POST_IMAGES).optional(),
  })
  // A post needs at least one of the two, which the old signature allowed to be
  // empty on both sides.
  .refine((v) => v.content.length > 0 || (v.imageUrls?.length ?? 0) > 0 || !!v.imageUrl, {
    message: "A post needs text or at least one image",
  });

export const postIdSchema = z.uuid();

/** Editing only touches the body. Swapping a post's images after the fact would
 *  quietly rewrite what people already replied to. */
export const updatePostSchema = z.object({
  postId: z.uuid(),
  content: z.string().trim().min(1).max(POST_CHAR_LIMIT),
});

export type UpdatePostInput = z.input<typeof updatePostSchema>;

export type CreatePostInput = z.input<typeof createPostSchema>;

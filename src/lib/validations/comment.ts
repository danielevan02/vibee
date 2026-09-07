import { z } from "zod";

import { COMMENT_CHAR_LIMIT } from "@/config/constants";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(COMMENT_CHAR_LIMIT),
  postId: z.uuid(),
  parentId: z.uuid().nullish(),
});

export const commentIdSchema = z.uuid();

export type CreateCommentInput = z.input<typeof createCommentSchema>;

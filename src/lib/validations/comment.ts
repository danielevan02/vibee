import { z } from "zod";

import { WORD_LIMIT } from "@/config/constants";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(WORD_LIMIT),
  postId: z.uuid(),
  parentId: z.uuid().nullish(),
});

export type CreateCommentInput = z.input<typeof createCommentSchema>;

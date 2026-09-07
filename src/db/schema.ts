/**
 * Single import point for database model types.
 *
 * Prisma 7 generates model types suffixed with `Model` (`UserModel`). They are
 * aliased back to bare names here so the rest of the codebase reads naturally
 * and the generated output stays an implementation detail - relocating or
 * regenerating it touches this file only.
 */
export type {
  UserModel as User,
  SessionModel as Session,
  AccountModel as Account,
  VerificationModel as Verification,
  FollowModel as Follow,
  PostModel as Post,
  CommentModel as Comment,
  LikeModel as Like,
  CommentLikeModel as CommentLike,
  BookmarkModel as Bookmark,
  NotificationModel as Notification,
  ReportModel as Report,
} from "@/generated/prisma/models";

/**
 * Read-side data access for post.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
import "server-only";

import { prisma } from "@/db";
import type { FeedKind } from "@/types/feed";

/**
 * The relation shape every post list shares.
 *
 * `likes` and `bookmarks` are scoped to the viewer deliberately. The UI only
 * ever asks "did *I* like/save this", and the totals come from `_count`, so
 * loading every row was both wasteful and wrong: an unscoped `bookmarks` array
 * made a post saved by anyone look saved to everyone.
 */
export function viewerPostInclude(viewerId: string) {
  return {
    author: true,
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    likes: {
      where: { authorId: viewerId },
      select: { authorId: true },
    },
    bookmarks: {
      where: { userId: viewerId },
      select: { userId: true },
    },
    comments: {
      where: { parentId: null },
      include: {
        ...viewerCommentInclude(viewerId),
        replies: {
          include: viewerCommentInclude(viewerId),
          orderBy: { createdAt: "asc" as const },
        },
      },
      orderBy: { createdAt: "desc" as const },
    },
  };
}

/**
 * A comment as the reader sees it: its author, how many likes it has, and
 * whether one of them is theirs. Same scoping trick as {@link viewerPostInclude}
 * - `likes` holds at most the reader's own row.
 */
export function viewerCommentInclude(viewerId: string) {
  return {
    author: true,
    _count: {
      select: { likes: true },
    },
    likes: {
      where: { authorId: viewerId },
      select: { authorId: true },
    },
  };
}

/**
 * One post by id, for its permalink page.
 *
 * Returns null rather than throwing when the id matches nothing, so the page
 * can call notFound() instead of unwrapping a status code.
 */
export async function getPostById(postId: string, viewerId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: viewerPostInclude(viewerId),
  });

  if (!post) return null;

  const [withFollowState] = await attachFollowState([post], viewerId);
  return withFollowState;
}

/**
 * Stamp each post with whether the viewer follows its author.
 *
 * One extra query for the whole page rather than a correlated sub-select per
 * row, and it means the options menu can render the right label immediately
 * instead of starting every post at "Follow".
 */
export async function attachFollowState<T extends { authorId: string }>(
  posts: T[],
  viewerId: string,
): Promise<(T & { viewerFollowsAuthor: boolean })[]> {
  const authorIds = [
    ...new Set(posts.map((p) => p.authorId).filter((id) => id !== viewerId)),
  ];

  if (authorIds.length === 0) {
    return posts.map((p) => ({ ...p, viewerFollowsAuthor: false }));
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: viewerId, followingId: { in: authorIds } },
    select: { followingId: true },
  });
  const following = new Set(follows.map((f) => f.followingId));

  return posts.map((p) => ({
    ...p,
    viewerFollowsAuthor: following.has(p.authorId),
  }));
}

/**
 * One page of the home timeline.
 *
 * `following` is the point of the follow button: it returns the posts of the
 * accounts the viewer follows, plus their own, so what they follow decides what
 * they read. `latest` and `frequencies` are the unfiltered firehose, ordered by
 * recency and by engagement respectively.
 */
export async function getFeedPosts({
  viewerId,
  feed = "latest",
  skip = 0,
  take = 10,
}: {
  viewerId: string;
  feed?: FeedKind;
  skip?: number;
  take?: number;
}) {
  try {
    const where =
      feed === "following"
        ? {
            OR: [
              { author: { followers: { some: { followerId: viewerId } } } },
              { authorId: viewerId },
            ],
          }
        : {};

    const posts = await prisma.post.findMany({
      where,
      skip,
      take,
      include: viewerPostInclude(viewerId),
      orderBy:
        feed === "frequencies"
          ? [
              { likes: { _count: "desc" } },
              { comments: { _count: "desc" } },
              { createdAt: "desc" },
            ]
          : { createdAt: "desc" },
    });

    return await attachFollowState(posts, viewerId);
  } catch (error) {
    console.error("getFeedPosts error:", error);
    return [];
  }
}

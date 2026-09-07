/**
 * Which slice of the home timeline the reader asked for.
 *
 * It lives here rather than in server/data/post.ts for the same reason the
 * explore shapes do: Client Components need it, and that module is server-only.
 */
export type FeedKind = "following" | "latest" | "frequencies";

export const FEED_KINDS: FeedKind[] = ["following", "latest", "frequencies"];

/**
 * Read a feed name off a URL, or null when it is not one.
 *
 * "chronological" and "trending" were the previous names, so links and
 * bookmarks pointing at them still resolve.
 */
export function parseFeedKind(value: string | null | undefined): FeedKind | null {
  if (value === "chronological") return "latest";
  if (value === "trending") return "frequencies";
  return (FEED_KINDS as string[]).includes(value ?? "") ? (value as FeedKind) : null;
}

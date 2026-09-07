import { redirect } from "next/navigation";

import HomeFeedStream from "@/components/features/feed/home-feed-stream";
import { getFollowingCount } from "@/server/data/user";
import { getCurrentUser } from "@/server/session";
import { parseFeedKind } from "@/types/feed";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [resolvedParams, followingCount] = await Promise.all([
    searchParams,
    getFollowingCount(user.id),
  ]);

  // Following is the point of the app, so it is the default - unless the reader
  // follows nobody, where it would just be an empty page on arrival.
  const initialFeed =
    parseFeedKind(resolvedParams.tab) ??
    (followingCount > 0 ? "following" : "latest");

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-16">
      <HomeFeedStream
        user={user}
        initialFeed={initialFeed}
        followingCount={followingCount}
      />
    </div>
  );
}

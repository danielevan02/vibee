import { notFound, redirect } from "next/navigation";

import ProfileView from "@/components/features/profile/profile-view";
import { getUserPosts, getUserProfile } from "@/server/data/user";
import { getCurrentUserId } from "@/server/session";

type ProfileTab = "vibes" | "replies" | "media" | "likes" | "bookmarks";
const TABS: ProfileTab[] = ["vibes", "replies", "media", "likes", "bookmarks"];

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const viewerId = await getCurrentUserId();
  if (!viewerId) redirect("/sign-in");

  const { username } = await params;
  const { tab: rawTab } = await searchParams;
  const tab = (TABS as string[]).includes(rawTab ?? "")
    ? (rawTab as ProfileTab)
    : "vibes";

  // Both in one pass: the profile does not gate the content query.
  const [profileResult, content] = await Promise.all([
    getUserProfile(username, viewerId),
    getUserPosts(username, tab),
  ]);

  if (profileResult.status !== 200 || !profileResult.user) notFound();

  return (
    <ProfileView
      key={`${username}|${tab}`}
      username={username}
      initialProfile={profileResult.user as never}
      initialIsFollowing={Boolean(profileResult.isFollowing)}
      initialIsOwnProfile={Boolean(profileResult.isOwnProfile)}
      initialPosts={(content.posts ?? []) as never}
      initialReplies={(content.replies ?? []) as never}
      tab={tab}
    />
  );
}

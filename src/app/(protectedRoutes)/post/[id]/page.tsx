import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CommentSection from "@/components/features/comment/comment-section";
import { Button } from "@/components/ui/button";
import { PREVIEW_WORD_LIMIT } from "@/config/constants";
import { getPostById } from "@/server/data/post";
import { getCurrentUserId } from "@/server/session";
import { clockTime, fullDate } from "@/lib/date";

/**
 * A post's permalink.
 *
 * Every "Copy link", Share and notification used to point at `/home#post-<id>`,
 * which only resolved if that post happened to be in the ten the feed had
 * loaded. This is the address those links actually meant.
 */
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewerId = await getCurrentUserId();
  if (!viewerId) redirect("/sign-in");

  const { id } = await params;
  const post = await getPostById(id, viewerId);
  if (!post) notFound();

  const words = (post.content || "").split(/\s+/);

  return (
    <div className="flex flex-col min-h-full shrink-0 pb-24 md:pb-16">
      {/* Same masthead token as the profile, so the thread header below can
          stick directly beneath it. */}
      <div className="sticky top-0 z-20 h-masthead shrink-0 backdrop-blur-xl bg-background/85 border-b border-border/50 px-4 sm:px-6 flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 hover:bg-accent/60"
        >
          <Link href="/home">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="font-serif font-normal text-base sm:text-lg leading-6 tracking-tight text-foreground truncate">
            Vibe
          </h1>
          <p className="text-[11px] leading-4 text-muted-foreground truncate">
            by @{post.author.username}
          </p>
        </div>
      </div>

      <CommentSection
        layout="page"
        post={post}
        date={fullDate(post.createdAt)}
        time={clockTime(post.createdAt)}
        wordLimit={PREVIEW_WORD_LIMIT}
        words={words}
        comments={post.comments}
      />
    </div>
  );
}

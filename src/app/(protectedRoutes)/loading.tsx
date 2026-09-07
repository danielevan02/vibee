import PostSkeleton from "@/components/features/post/post-skeleton";

/**
 * Loading state for every signed-in page.
 *
 * Per the loading.js convention this renders *inside* the protected layout, so
 * the sidebar, the right rail and the header stay put and stay interactive
 * while only the content column swaps. Previously the app's single boundary was
 * at the root, which meant every navigation replaced the entire shell with a
 * full-screen logo and then rebuilt it.
 *
 * A skeleton rather than a spinner, because that is what the feed itself shows
 * while it loads - the two now agree.
 */
export default function ProtectedLoading() {
  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-16 space-y-6">
      {/* Stands in for the page's own heading block */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/60 animate-pulse">
        <div className="space-y-2">
          <div className="w-20 h-2.5 rounded-md bg-muted/60" />
          <div className="w-32 h-6 rounded-lg bg-muted/70" />
          <div className="w-56 h-2.5 rounded-md bg-muted/50" />
        </div>
        <div className="w-44 h-8 rounded-full bg-muted/50 hidden sm:block" />
      </div>

      <div className="space-y-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
}

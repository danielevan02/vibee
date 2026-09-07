import BrandLogo from "@/components/features/shell/brand-logo";

/**
 * The root splash.
 *
 * This is now the cold-start screen only: navigating between signed-in pages
 * resolves at `(protectedRoutes)/loading.tsx`, which keeps the sidebar and rails
 * on screen instead of replacing the whole app with a logo.
 *
 * A Server Component - no theme hook, no hydration guard, so it paints with the
 * first byte rather than after JavaScript arrives.
 */
export default function LoadingPage() {
  return (
    <div className="relative min-h-dvh w-full bg-background flex flex-col items-center justify-center gap-3 px-6">
      <div className="animate-pulse">
        <BrandLogo size={40} priority />
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="font-serif font-normal text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
          VIBEE
        </p>
        {/* The same micro-label the sidebar wears, so the splash and the app
            read as one product. */}
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-foreground/40 animate-pulse" />
          Sanctuary
        </span>
      </div>

      <p className="absolute bottom-10 text-[11px] text-muted-foreground/70 text-center">
        Made by <span className="font-medium text-muted-foreground">Daniel Evan</span>
      </p>
    </div>
  );
}

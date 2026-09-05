export default function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-5 space-y-4 animate-pulse">
      {/* Top Author Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/70" />
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 rounded-md bg-muted/80" />
            <div className="w-20 h-2.5 rounded-md bg-muted/60" />
          </div>
        </div>
        <div className="w-14 h-2.5 rounded-md bg-muted/50" />
      </div>

      {/* Content Lines */}
      <div className="space-y-2 pt-1">
        <div className="w-full h-3 rounded-md bg-muted/70" />
        <div className="w-[85%] h-3 rounded-md bg-muted/70" />
        <div className="w-[60%] h-3 rounded-md bg-muted/60" />
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-4 rounded-md bg-muted/60" />
          <div className="w-12 h-4 rounded-md bg-muted/60" />
          <div className="w-10 h-4 rounded-md bg-muted/50" />
        </div>
        <div className="w-6 h-4 rounded-md bg-muted/50" />
      </div>
    </div>
  );
}

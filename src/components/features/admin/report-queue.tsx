"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Flag, ShieldCheck, Loader2, ExternalLink, Inbox } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateReportStatus } from "@/server/actions/report";
import { REPORT_STATUSES, type ReportStatus } from "@/lib/validations/report";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import { relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { interactive } from "@/lib/ui";

interface ReportRow {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: Date;
  reporter: {
    id: string;
    name: string;
    username: string;
    photo: string | null;
  };
  post: {
    id: string;
    content: string | null;
    imageUrl: string | null;
    createdAt: Date;
    author: { id: string; name: string; username: string; photo: string | null };
  };
}

interface ReportQueueProps {
  reports: ReportRow[];
  counts: Record<string, number>;
  status?: ReportStatus;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  REVIEWED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  DISMISSED: "bg-muted text-muted-foreground border-border/60",
};

/**
 * Client island for the moderation queue.
 *
 * The filter lives in the URL so the server renders the right list, matching
 * how notifications and explore already work.
 */
export default function ReportQueue({ reports, counts, status }: ReportQueueProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState(reports);
  const [busyId, setBusyId] = useState<string | null>(null);

  const applyFilter = (next?: ReportStatus) => {
    startTransition(() => {
      router.replace(next ? `/admin/reports?status=${next}` : "/admin/reports");
    });
  };

  const handleSetStatus = async (reportId: string, next: ReportStatus) => {
    setBusyId(reportId);
    try {
      const result = await updateReportStatus({ reportId, status: next });
      if (result.ok) {
        setRows((prev) =>
          // When a filter is active the row no longer belongs here, so drop it
          // rather than leaving it sitting under a heading it contradicts.
          status
            ? prev.filter((r) => r.id !== reportId)
            : prev.map((r) => (r.id === reportId ? { ...r, status: next } : r)),
        );
        toast.success(`Marked ${next.toLowerCase()}`);
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      toast.error("Failed to update this report");
    } finally {
      setBusyId(null);
    }
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col min-h-full shrink-0 pb-24 md:pb-16">
      {/* Masthead */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/85 border-b border-border/50 px-4 sm:px-6 py-4 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-normal text-2xl sm:text-3xl tracking-tight text-foreground">
              Moderation
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {total} {total === 1 ? "report" : "reports"} in total
            </p>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto subtle-scrollbar pb-1">
          <button
            onClick={() => applyFilter(undefined)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0",
              interactive,
              !status
                ? "bg-background text-foreground border border-border/60"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            All
          </button>
          {REPORT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => applyFilter(s)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 flex items-center gap-1.5",
                interactive,
                status === s
                  ? "bg-background text-foreground border border-border/60"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-background/60",
              )}
            >
              <span className="capitalize">{s.toLowerCase()}</span>
              <span className="text-[10px] font-mono opacity-70">
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Queue */}
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading reports...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-base text-foreground">
              Nothing to review
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              {status
                ? `No reports are marked ${status.toLowerCase()}.`
                : "No one has reported a vibe yet."}
            </p>
          </div>
        ) : (
          rows.map((report) => (
            <article
              key={report.id}
              className="rounded-3xl border border-border/70 bg-card/60 dark:bg-card/30 backdrop-blur-xl p-5 space-y-3.5"
            >
              {/* Header: reason, status, when */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {report.reason}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      STATUS_STYLE[report.status] ?? STATUS_STYLE.DISMISSED,
                    )}
                  >
                    {report.status}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {relativeTime(report.createdAt)}
                </span>
              </div>

              {/* Who reported it */}
              <p className="text-xs text-muted-foreground">
                Reported by{" "}
                <Link
                  href={`/profile/${report.reporter.username}`}
                  className="font-medium text-foreground hover:underline"
                >
                  @{report.reporter.username}
                </Link>
              </p>

              {report.details && (
                <p className="text-xs text-foreground/90 leading-relaxed p-3 rounded-xl border border-border/50 bg-background/50 whitespace-pre-wrap break-words">
                  {report.details}
                </p>
              )}

              {/* The reported vibe */}
              <Link
                href={`/post/${report.post.id}`}
                className={cn(
                  "block p-3.5 rounded-2xl border border-border/60 bg-background/40 hover:border-primary/40 group",
                  interactive,
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border/70 shrink-0">
                    <Image
                      src={report.post.author.photo || "/user-placeholder.png"}
                      alt={report.post.author.name}
                      fill
                      sizes="24px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    @{report.post.author.username}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {report.post.content && (
                  <p className="text-xs text-foreground/80 line-clamp-3 whitespace-pre-wrap break-words">
                    {report.post.content}
                  </p>
                )}

                {report.post.imageUrl && (
                  <div className="relative w-full h-28 mt-2 rounded-xl overflow-hidden border border-border/60">
                    <Image
                      src={report.post.imageUrl}
                      alt="Reported media"
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover"
                    />
                  </div>
                )}
              </Link>

              {/* Decisions */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/40">
                {REPORT_STATUSES.filter((s) => s !== report.status).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    disabled={busyId === report.id}
                    onClick={() => handleSetStatus(report.id, s)}
                    className="rounded-full h-8 px-3.5 text-xs font-medium mt-3 capitalize"
                  >
                    {busyId === report.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      s.toLowerCase()
                    )}
                  </Button>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

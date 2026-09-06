"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog";
import { Button } from "@/components/ui/button";
import {
  Flag,
  AlertTriangle,
  Ban,
  ShieldAlert,
  FileQuestion,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { createReport } from "@/server/actions/report";
import { toast } from "sonner";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import { cn } from "@/lib/utils";

interface ReportModalProps {
  postId: string;
  authorUsername: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  {
    id: "SPAM",
    title: "Spam or scam",
    description: "Commercial spam, suspicious links, impersonation, or bot activity.",
    icon: Ban,
  },
  {
    id: "HARASSMENT",
    title: "Harassment or hate speech",
    description: "Personal attacks, bullying, threats, or hateful conduct.",
    icon: ShieldAlert,
  },
  {
    id: "INAPPROPRIATE",
    title: "Inappropriate or sensitive content",
    description: "Explicit adult content, excessive violence, or graphic imagery.",
    icon: AlertTriangle,
  },
  {
    id: "MISINFORMATION",
    title: "Misinformation or deceit",
    description: "Manipulated media, medical falsehoods, or fraudulent hoaxes.",
    icon: Flag,
  },
  {
    id: "OTHER",
    title: "Something else",
    description: "Any other issue that violates community standards.",
    icon: FileQuestion,
  },
];

export default function ReportModal({
  postId,
  authorUsername,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("SPAM");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await createReport({
        postId,
        reason: selectedReason,
        details,
      });

      if (result.ok) {
        setSubmitted(true);
        toast.success("Report submitted. Thank you for helping keep VIBEE safe!");
        setTimeout(() => {
          setSubmitted(false);
          setDetails("");
          setSelectedReason("SPAM");
          onClose();
        }, 1200);
      } else if (result.error === "conflict") {
        toast.info("You have already reported this vibe.");
        onClose();
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) {
          setSubmitted(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg p-6 rounded-3xl bg-background/95 dark:bg-card/95 backdrop-blur-2xl border border-border">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-normal text-foreground">Report Received</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
              Your report has been securely saved to our database and logged for moderation.
            </p>
          </div>
        ) : (
          <>
            <DialogTitle className="flex items-center gap-2.5 font-serif text-lg font-normal text-foreground">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <span>Report Vibe</span>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Report post by @{authorUsername}
                </p>
              </div>
            </DialogTitle>

            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Help us maintain an authentic and safe community. Please select the primary reason for reporting this post:
            </p>

            {/* Reasons List */}
            <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto pr-1">
              {REPORT_REASONS.map((reason) => {
                const Icon = reason.icon;
                const isSelected = selectedReason === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer",
                      isSelected
                        ? "border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30"
                        : "border-border/60 hover:border-border hover:bg-accent/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        isSelected
                          ? "bg-rose-500/20 text-rose-500"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          isSelected ? "text-rose-500" : "text-foreground"
                        )}
                      >
                        {reason.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {reason.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Details Textarea */}
            <div className="mt-4 space-y-1.5">
              <label
                htmlFor="report-details"
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Additional context (optional)
              </label>
              <textarea
                id="report-details"
                value={details}
                maxLength={280}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Share any extra details to help our moderation team investigate..."
                rows={2}
                className="w-full text-xs rounded-xl border border-border/70 bg-background/50 p-2.5 placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-rose-500/50 resize-none transition-[color,background-color,border-color,box-shadow]"
              />
              <div className="text-[10px] text-muted-foreground/80 text-right">
                {details.length}/280
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
                className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="rounded-xl px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      offset={20}
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans text-xs sm:text-sm tracking-tight font-medium rounded-2xl",
          title: "font-semibold text-foreground text-xs sm:text-[13.5px]",
          description: "text-muted-foreground text-xs mt-0.5",
          actionButton:
            "bg-primary text-primary-foreground font-semibold rounded-xl px-3 py-1.5 text-xs hover:opacity-90 transition-[opacity]",
          cancelButton:
            "bg-muted text-muted-foreground font-medium rounded-xl px-3 py-1.5 text-xs hover:bg-muted/80 transition-colors",
          closeButton:
            "border border-border/60 bg-background/80 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-colors",
        },
      }}
      icons={{
        success: (
          <div className="w-6 h-6 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ),
        error: (
          <div className="w-6 h-6 rounded-full bg-rose-500/15 dark:bg-rose-500/25 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ),
        info: (
          <div className="w-6 h-6 rounded-full bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ),
        warning: (
          <div className="w-6 h-6 rounded-full bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ),
        loading: (
          <div className="w-6 h-6 rounded-full bg-primary/15 dark:bg-primary/25 text-primary flex items-center justify-center shrink-0 border border-primary/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
          </div>
        ),
      }}
      {...props}
    />
  );
};

export { Toaster };

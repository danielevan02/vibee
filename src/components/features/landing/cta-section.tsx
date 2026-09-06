"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useReveal } from "./motion-presets";
import { ArrowRight, CheckCircle2, AtSign, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  const [handle, setHandle] = useState("");
  const { container, item, whenInView } = useReveal({ y: 16, duration: 0.65 });

  const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto">
        <motion.div
          {...whenInView}
          variants={container}
          className="relative rounded-3xl sm:rounded-[36px] overflow-hidden border border-border/80 p-8 sm:p-16 lg:p-20 text-center"
        >
          {/* Classical Impressionist Panoramic Background with Gradient Fade */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/paintings/cta-pathway.jpg"
              alt="Impressionist oil painting of an open gate leading into a sunlit creative sanctuary"
              fill
              sizes="(max-width: 1240px) 100vw, 1240px"
              className="object-cover object-center opacity-70 dark:opacity-40"
            />
            {/* Editorial Glass & Gradient Wash */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background/98 dark:from-black/75 dark:via-black/90 dark:to-[#0c0d10]" />
          </div>

          {/* Content Layer */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              variants={item}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4"
            >
              <span>Instant Access</span>
            </motion.div>

            <motion.h2
              variants={item}
              className="font-serif text-3xl sm:text-5xl lg:text-[3.65rem] font-normal tracking-tight text-foreground leading-[1.12] mb-5"
            >
              Connection is now <br />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent italic font-normal">
                simpler than ever.
              </span>
            </motion.h2>

            <motion.p
              variants={item}
              className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-9 leading-relaxed font-normal"
            >
              Your unhurried space on the internet is ready. Reserve your unique handle and join our quiet community of thinkers and creators.
            </motion.p>

            {/* Interactive Handle Claim Box */}
            <motion.div variants={item} className="max-w-md mx-auto mb-6">
              <div className="relative flex items-center rounded-full border border-border/80 bg-background/95 dark:bg-card/95 p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-[color,background-color,border-color,box-shadow]">
                <div className="flex items-center pl-3 text-muted-foreground font-medium text-sm">
                  <AtSign className="w-4 h-4 mr-1 text-primary" />
                </div>
                <input
                  type="text"
                  value={cleanHandle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourhandle"
                  className="w-full bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 px-1 py-2 font-medium"
                />
                <Link href={cleanHandle ? `/sign-up?username=${cleanHandle}` : "/sign-up"}>
                  <Button className="rounded-full px-6 h-10 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shrink-0 transition-[color,background-color,border-color,transform] duration-200 active:scale-95 border-0">
                    Claim Handle
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>

              {cleanHandle && (
                <p className="mt-2 text-xs text-blue-600 dark:text-sky-400 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> vibee.app/@{cleanHandle} is available to reserve!
                </p>
              )}
            </motion.div>

            {/* Trust Assurances */}
            <motion.div
              variants={item}
              className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> Free Forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> 100% Chronological
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> No Algorithmic Feed
              </span>
            </motion.div>

            <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-center">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-sky-400 hover:underline transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                Want to browse first? Explore community feed as guest →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

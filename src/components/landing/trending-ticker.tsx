"use client";

import { Sparkles, TrendingUp, Flame, Heart, MessageSquare, Coffee, Radio } from "lucide-react";

export default function TrendingTicker() {
  const row1Topics = [
    { tag: "QuietInternet", count: "2.4k vibes", icon: Sparkles },
    { tag: "SlowReading", count: "1.8k vibes", icon: Coffee },
    { tag: "IndieMakers", count: "3.1k vibes", icon: TrendingUp },
    { tag: "LateNightThoughts", count: "4.5k vibes", icon: Heart },
    { tag: "NoAlgorithmicNoise", count: "980 vibes", icon: Radio },
    { tag: "EssaysAndMusings", count: "2.9k vibes", icon: MessageSquare },
  ];

  const row2Topics = [
    { tag: "GoldenHourThoughts", count: "1.4k vibes", icon: Sparkles },
    { tag: "FilmPhotography", count: "3.7k vibes", icon: Flame },
    { tag: "AnalogLiving", count: "890 vibes", icon: Coffee },
    { tag: "RawDiscussions", count: "5.2k vibes", icon: Heart },
    { tag: "MindfulSocial", count: "1.1k vibes", icon: Radio },
    { tag: "DeepConversations", count: "2.6k vibes", icon: MessageSquare },
  ];

  return (
    <section className="relative py-8 bg-gradient-to-r from-[#060b18] via-[#0d1c42] to-[#060b18] text-white border-y border-blue-500/20 overflow-hidden">
      {/* Editorial Header */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between text-xs tracking-wider uppercase text-sky-200/70">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
          <span className="font-semibold text-white">Community Frequencies Right Now</span>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-sky-300/60">
          Unhurried • Unfiltered • Chronological
        </span>
      </div>

      {/* Marquee with Mask */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {/* Row 1 */}
        <div className="animate-marquee flex gap-3 pb-2.5">
          {[...row1Topics, ...row1Topics].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`r1-${index}`}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-400/25 bg-blue-500/10 text-xs sm:text-sm font-medium hover:border-blue-400/50 hover:bg-blue-500/20 transition-colors cursor-default whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-white">#{item.tag}</span>
                <span className="text-sky-200/60 text-[11px]">• {item.count}</span>
              </div>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="animate-marquee-reverse flex gap-3 pt-1">
          {[...row2Topics, ...row2Topics].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`r2-${index}`}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-400/25 bg-blue-500/10 text-xs sm:text-sm font-medium hover:border-blue-400/50 hover:bg-blue-500/20 transition-colors cursor-default whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-white">#{item.tag}</span>
                <span className="text-sky-200/60 text-[11px]">• {item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

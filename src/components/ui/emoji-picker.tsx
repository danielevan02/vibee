"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
  buttonLabel?: string;
  variant?: "default" | "compact";
  placement?: "auto" | "top" | "bottom";
}

interface EmojiCategory {
  name: string;
  icon: string;
  emojis: { emoji: string; keywords: string[] }[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Smileys",
    icon: "😊",
    emojis: [
      { emoji: "😀", keywords: ["grinning", "happy", "smile"] },
      { emoji: "😃", keywords: ["smiley", "happy", "joy"] },
      { emoji: "😄", keywords: ["smile", "laugh", "happy"] },
      { emoji: "😁", keywords: ["grin", "beaming", "happy"] },
      { emoji: "😆", keywords: ["laughing", "satisfied", "lol"] },
      { emoji: "😅", keywords: ["sweat", "smile", "relief"] },
      { emoji: "😂", keywords: ["joy", "tears", "lol", "lmao", "funny"] },
      { emoji: "🤣", keywords: ["rofl", "rolling", "laugh"] },
      { emoji: "🥲", keywords: ["smiling", "tear", "bittersweet"] },
      { emoji: "🥹", keywords: ["pleading", "holding", "tears", "cute"] },
      { emoji: "😊", keywords: ["blush", "smile", "happy"] },
      { emoji: "😇", keywords: ["angel", "innocent", "halo"] },
      { emoji: "🙂", keywords: ["slight", "smile"] },
      { emoji: "🙃", keywords: ["upside", "down", "sarcasm"] },
      { emoji: "😉", keywords: ["wink", "flirt"] },
      { emoji: "😌", keywords: ["relieved", "peaceful"] },
      { emoji: "😍", keywords: ["heart", "eyes", "love", "crush"] },
      { emoji: "🥰", keywords: ["smiling", "hearts", "adore"] },
      { emoji: "😘", keywords: ["kiss", "love"] },
      { emoji: "😗", keywords: ["kissing"] },
      { emoji: "😋", keywords: ["yum", "delicious", "tongue"] },
      { emoji: "😛", keywords: ["tongue", "playful"] },
      { emoji: "😜", keywords: ["wink", "tongue", "joke"] },
      { emoji: "🤪", keywords: ["crazy", "zany", "wild"] },
      { emoji: "😎", keywords: ["cool", "sunglasses", "swag"] },
      { emoji: "🤩", keywords: ["star", "struck", "wow"] },
      { emoji: "🥳", keywords: ["party", "celebrate", "birthday"] },
      { emoji: "😏", keywords: ["smirk", "sly"] },
      { emoji: "😒", keywords: ["unamused", "meh"] },
      { emoji: "😞", keywords: ["disappointed", "sad"] },
      { emoji: "😔", keywords: ["pensive", "sad"] },
      { emoji: "😟", keywords: ["worried", "nervous"] },
      { emoji: "😕", keywords: ["confused", "slight"] },
      { emoji: "🙁", keywords: ["frown", "sad"] },
      { emoji: "😣", keywords: ["persevering", "struggle"] },
      { emoji: "😖", keywords: ["confounded"] },
      { emoji: "😫", keywords: ["tired", "exhausted"] },
      { emoji: "😩", keywords: ["weary", "frustrated"] },
      { emoji: "🥺", keywords: ["pleading", "begging", "puppy"] },
      { emoji: "😢", keywords: ["crying", "tear", "sad"] },
      { emoji: "😭", keywords: ["sob", "crying", "loudly", "sad"] },
      { emoji: "😤", keywords: ["triumph", "huff", "steam"] },
      { emoji: "😠", keywords: ["angry", "mad"] },
      { emoji: "😡", keywords: ["rage", "pouting", "furious"] },
      { emoji: "🤯", keywords: ["exploding", "head", "mindblown"] },
      { emoji: "😳", keywords: ["flushed", "shocked"] },
      { emoji: "🥵", keywords: ["hot", "sweating"] },
      { emoji: "🥶", keywords: ["cold", "freezing"] },
      { emoji: "😱", keywords: ["scream", "fear", "scared"] },
      { emoji: "😨", keywords: ["fearful", "scared"] },
      { emoji: "😰", keywords: ["anxious", "sweat"] },
      { emoji: "😥", keywords: ["sad", "relieved"] },
      { emoji: "😓", keywords: ["downcast", "sweat"] },
      { emoji: "🤗", keywords: ["hugs", "warm"] },
      { emoji: "🤔", keywords: ["thinking", "hmm", "ponder"] },
      { emoji: "🫣", keywords: ["peeking", "shy"] },
      { emoji: "🤭", keywords: ["giggle", "oops"] },
      { emoji: "🫢", keywords: ["gasp", "shock"] },
      { emoji: "🫡", keywords: ["salute", "respect"] },
      { emoji: "🤫", keywords: ["shh", "quiet", "secret"] },
      { emoji: "🫠", keywords: ["melting", "sinking"] },
      { emoji: "🤐", keywords: ["zipper", "silent"] },
      { emoji: "😴", keywords: ["sleeping", "tired"] },
      { emoji: "🥱", keywords: ["yawn", "bored"] },
    ],
  },
  {
    name: "Gestures",
    icon: "👍",
    emojis: [
      { emoji: "👋", keywords: ["wave", "hello", "bye"] },
      { emoji: "🤚", keywords: ["raised", "back", "hand"] },
      { emoji: "🖐️", keywords: ["fingers", "splayed"] },
      { emoji: "✋", keywords: ["raised", "hand", "high", "five"] },
      { emoji: "🖖", keywords: ["vulcan", "spock"] },
      { emoji: "👌", keywords: ["ok", "perfect", "good"] },
      { emoji: "🤌", keywords: ["pinched", "italian", "chef"] },
      { emoji: "🤏", keywords: ["pinching", "little", "bit"] },
      { emoji: "✌️", keywords: ["peace", "victory", "two"] },
      { emoji: "🤞", keywords: ["crossed", "fingers", "luck"] },
      { emoji: "🫰", keywords: ["hand", "heart", "kpop"] },
      { emoji: "🤟", keywords: ["love", "you", "gesture"] },
      { emoji: "🤘", keywords: ["rock", "on", "metal"] },
      { emoji: "🤙", keywords: ["call", "me", "shaka"] },
      { emoji: "👈", keywords: ["left", "point"] },
      { emoji: "👉", keywords: ["right", "point"] },
      { emoji: "👆", keywords: ["up", "point"] },
      { emoji: "👇", keywords: ["down", "point"] },
      { emoji: "☝️", keywords: ["index", "up"] },
      { emoji: "👍", keywords: ["thumbs", "up", "like", "approve"] },
      { emoji: "👎", keywords: ["thumbs", "down", "dislike"] },
      { emoji: "✊", keywords: ["fist", "raised", "power"] },
      { emoji: "👊", keywords: ["fist", "bump", "punch"] },
      { emoji: "🤛", keywords: ["left", "fist"] },
      { emoji: "🤜", keywords: ["right", "fist"] },
      { emoji: "👏", keywords: ["clap", "applause", "bravo"] },
      { emoji: "🙌", keywords: ["hands", "celebration", "praise"] },
      { emoji: "👐", keywords: ["open", "hands"] },
      { emoji: "🤲", keywords: ["palms", "up", "together"] },
      { emoji: "🤝", keywords: ["handshake", "deal", "agree"] },
      { emoji: "🙏", keywords: ["pray", "please", "thanks", "namaste"] },
      { emoji: "✍️", keywords: ["writing", "hand", "note"] },
      { emoji: "💪", keywords: ["flex", "biceps", "strong", "power"] },
      { emoji: "🧠", keywords: ["brain", "smart", "mind"] },
      { emoji: "👀", keywords: ["eyes", "look", "see", "watch"] },
      { emoji: "👁️", keywords: ["eye"] },
      { emoji: "🧑‍💻", keywords: ["developer", "coder", "programmer"] },
      { emoji: "👩‍💻", keywords: ["woman", "technologist", "coder"] },
    ],
  },
  {
    name: "Hearts & Vibes",
    icon: "❤️",
    emojis: [
      { emoji: "❤️", keywords: ["red", "heart", "love"] },
      { emoji: "🧡", keywords: ["orange", "heart"] },
      { emoji: "💛", keywords: ["yellow", "heart"] },
      { emoji: "💚", keywords: ["green", "heart"] },
      { emoji: "💙", keywords: ["blue", "heart", "vibee"] },
      { emoji: "💜", keywords: ["purple", "heart"] },
      { emoji: "🖤", keywords: ["black", "heart"] },
      { emoji: "🤍", keywords: ["white", "heart"] },
      { emoji: "🤎", keywords: ["brown", "heart"] },
      { emoji: "💔", keywords: ["broken", "heart", "heartbreak"] },
      { emoji: "❤️‍🔥", keywords: ["heart", "fire", "passion"] },
      { emoji: "❤️‍🩹", keywords: ["mending", "heart", "healing"] },
      { emoji: "❣️", keywords: ["heart", "exclamation"] },
      { emoji: "💕", keywords: ["two", "hearts"] },
      { emoji: "💞", keywords: ["revolving", "hearts"] },
      { emoji: "💓", keywords: ["beating", "heart"] },
      { emoji: "💗", keywords: ["growing", "heart"] },
      { emoji: "💖", keywords: ["sparkling", "heart"] },
      { emoji: "💘", keywords: ["heart", "arrow", "cupid"] },
      { emoji: "💝", keywords: ["heart", "ribbon"] },
      { emoji: "✨", keywords: ["sparkles", "magic", "stars"] },
      { emoji: "🌟", keywords: ["glowing", "star"] },
      { emoji: "⭐", keywords: ["star", "favorite"] },
      { emoji: "💫", keywords: ["dizzy", "star"] },
      { emoji: "🔥", keywords: ["fire", "flame", "lit", "hot"] },
      { emoji: "💥", keywords: ["collision", "boom", "bang"] },
      { emoji: "⚡", keywords: ["lightning", "zap", "electric", "fast"] },
      { emoji: "🌈", keywords: ["rainbow", "pride"] },
      { emoji: "☀️", keywords: ["sun", "sunny"] },
      { emoji: "🌙", keywords: ["moon", "night"] },
      { emoji: "☁️", keywords: ["cloud", "weather"] },
      { emoji: "❄️", keywords: ["snowflake", "winter"] },
      { emoji: "🌊", keywords: ["wave", "ocean", "water"] },
    ],
  },
  {
    name: "Objects & Fun",
    icon: "🎉",
    emojis: [
      { emoji: "🎉", keywords: ["party", "popper", "celebrate"] },
      { emoji: "🎊", keywords: ["confetti", "ball"] },
      { emoji: "🎈", keywords: ["balloon", "party"] },
      { emoji: "🎁", keywords: ["gift", "present"] },
      { emoji: "🏆", keywords: ["trophy", "winner", "first"] },
      { emoji: "🥇", keywords: ["gold", "medal", "1st"] },
      { emoji: "🎯", keywords: ["target", "bullseye", "goal"] },
      { emoji: "🚀", keywords: ["rocket", "launch", "fast", "crypto"] },
      { emoji: "💡", keywords: ["bulb", "idea", "light"] },
      { emoji: "☕", keywords: ["coffee", "tea", "cafe"] },
      { emoji: "🍕", keywords: ["pizza", "food"] },
      { emoji: "🍔", keywords: ["burger", "food"] },
      { emoji: "🍟", keywords: ["fries", "food"] },
      { emoji: "🍻", keywords: ["beers", "cheers"] },
      { emoji: "🥂", keywords: ["champagne", "toast"] },
      { emoji: "🍾", keywords: ["bottle", "popping"] },
      { emoji: "🍿", keywords: ["popcorn", "movie"] },
      { emoji: "🍩", keywords: ["donut", "sweet"] },
      { emoji: "🍪", keywords: ["cookie"] },
      { emoji: "🎵", keywords: ["musical", "note"] },
      { emoji: "🎶", keywords: ["notes", "music"] },
      { emoji: "🎧", keywords: ["headphones", "music"] },
      { emoji: "🎮", keywords: ["game", "gaming", "controller"] },
      { emoji: "🕹️", keywords: ["joystick"] },
      { emoji: "💻", keywords: ["laptop", "computer", "tech"] },
      { emoji: "📱", keywords: ["phone", "mobile"] },
      { emoji: "📸", keywords: ["camera", "photo"] },
      { emoji: "💸", keywords: ["money", "wings", "cash"] },
      { emoji: "💎", keywords: ["gem", "diamond"] },
      { emoji: "💯", keywords: ["100", "hundred", "perfect"] },
      { emoji: "🔔", keywords: ["bell", "notification"] },
      { emoji: "📌", keywords: ["pin", "pushpin"] },
      { emoji: "📍", keywords: ["location", "pin"] },
    ],
  },
];

export default function EmojiPicker({
  onSelectEmoji,
  disabled = false,
  buttonLabel = "Emoji",
  variant = "default",
  placement = "auto",
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [openDirection, setOpenDirection] = useState<"top" | "bottom">("bottom");
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Dynamically calculate placement based on viewport space
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    if (placement !== "auto") {
      setOpenDirection(placement);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;

    // If close to top of viewport (< 360px), open downwards to avoid clipping
    if (spaceAbove < 360) {
      setOpenDirection("bottom");
    } else {
      setOpenDirection("top");
    }
  }, [isOpen, placement]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
  };

  // Filter emojis if search query is provided
  const filteredEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter(
        (e) =>
          e.emoji.includes(searchQuery) ||
          e.keywords.some((k) =>
            k.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : EMOJI_CATEGORIES[selectedCategoryIndex].emojis;

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === "compact"
            ? "p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
            : "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 cursor-pointer"
        }
        title="Insert an emoji"
        aria-label="Insert an emoji"
      >
        <Smile className="w-4 h-4 text-primary" />
        {variant !== "compact" && (
          <span className="hidden sm:inline">{buttonLabel}</span>
        )}
      </button>

      {/* Floating Emoji Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: openDirection === "bottom" ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: openDirection === "bottom" ? -8 : 8 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute left-0 sm:left-auto sm:-left-12 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border bg-popover dark:bg-card text-popover-foreground ring-1 ring-black/5 dark:ring-white/10 p-3 flex flex-col gap-2.5 z-50 animate-in",
              openDirection === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
            )}
          >
            {/* Popover Header with Search & Close */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search emoji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-muted/40 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close emoji picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Tabs (shown when not searching) */}
            {!searchQuery && (
              <div className="flex items-center justify-around pb-1 border-b border-border/40">
                {EMOJI_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategoryIndex(idx)}
                    className={`px-2.5 py-1 text-sm rounded-lg transition-[color,background-color,border-color,opacity,transform] cursor-pointer ${
                      selectedCategoryIndex === idx
                        ? "bg-primary/15 scale-110"
                        : "hover:bg-accent/60 opacity-60 hover:opacity-100"
                    }`}
                    title={cat.name}
                  >
                    {cat.icon}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Grid */}
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1 max-h-48 overflow-y-auto subtle-scrollbar p-0.5">
              {filteredEmojis.length > 0 ? (
                filteredEmojis.map((item, idx) => (
                  <button
                    key={`${item.emoji}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(item.emoji)}
                    className="w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-accent/70 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                    title={item.keywords[0]}
                  >
                    {item.emoji}
                  </button>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                  No emojis match &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

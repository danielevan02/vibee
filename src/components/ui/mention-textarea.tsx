"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import Image from "next/image";
import { CheckCircle2, AtSign } from "lucide-react";
import { searchMentionUsers } from "@/actions/user.action";

export interface MentionUser {
  id: string;
  name: string;
  username: string;
  photo?: string | null;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  rows?: number;
  className?: string;
  minHeight?: string;
}

export interface MentionTextareaRef {
  focus: () => void;
  textarea: HTMLTextAreaElement | null;
}

const MentionTextarea = forwardRef<MentionTextareaRef, MentionTextareaProps>(
  (
    {
      value,
      onChange,
      placeholder = "What's on your mind? Type @ to mention...",
      maxLength = 300,
      disabled = false,
      rows = 3,
      className = "",
      minHeight = "75px",
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeMentionRef = useRef<HTMLSpanElement>(null);

    const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({
      top: 26,
      left: 0,
    });

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      textarea: textareaRef.current,
    }));

    // Calculate dynamic position of the popup directly under the @ mention
    useEffect(() => {
      if (showPopup && activeMentionRef.current && containerRef.current) {
        const mentionRect = activeMentionRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const relativeTop = mentionRect.bottom - containerRect.top + 4;
        const relativeLeft = mentionRect.left - containerRect.left;

        // Ensure popup doesn't overflow right edge of container
        const maxLeft = Math.max(0, containerRect.width - 280);
        const clampedLeft = Math.max(0, Math.min(relativeLeft, maxLeft));

        setPopupPosition({
          top: relativeTop,
          left: clampedLeft,
        });
      }
    }, [showPopup, mentionQuery, suggestions, value]);

    // Synchronize textarea scroll to backdrop layer
    const handleScroll = () => {
      if (backdropRef.current && textareaRef.current) {
        backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    };

    // Detect active @mention at cursor
    const checkMention = useCallback(
      async (text: string, cursorPosition: number) => {
        const textBeforeCursor = text.slice(0, cursorPosition);
        // Find last @ that isn't preceded by non-whitespace (or is at the start)
        const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);

        if (match) {
          const query = match[1];
          const atIndex = textBeforeCursor.lastIndexOf("@");
          setMentionQuery(query);
          setMentionStartIndex(atIndex);

          try {
            const res = await searchMentionUsers(query);
            if (res.status === 200 && res.users.length > 0) {
              setSuggestions(res.users);
              setSelectedIndex(0);
              setShowPopup(true);
            } else {
              setShowPopup(false);
            }
          } catch {
            setShowPopup(false);
          }
        } else {
          setShowPopup(false);
        }
      },
      []
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      const cursor = e.target.selectionStart || 0;
      checkMention(newValue, cursor);
    };

    const handleSelectUser = (user: MentionUser) => {
      if (mentionStartIndex === -1 || !textareaRef.current) return;

      const cursor = textareaRef.current.selectionStart || 0;
      const textBeforeMention = value.slice(0, mentionStartIndex);
      const textAfterCursor = value.slice(cursor);
      const mentionText = `@${user.username} `;

      const updatedText = textBeforeMention + mentionText + textAfterCursor;
      onChange(updatedText);
      setShowPopup(false);

      // Re-focus and position cursor immediately after the inserted mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursor = textBeforeMention.length + mentionText.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursor, newCursor);
        }
      }, 10);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showPopup || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? suggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleSelectUser(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowPopup(false);
      }
    };

    // Close popup on outside click
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setShowPopup(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Render highlighted text tokens for the backdrop
    const renderBackdropContent = () => {
      if (!value) {
        return (
          <span className="text-muted-foreground/60 select-none">
            {placeholder}
          </span>
        );
      }

      // Split text into tokens including mentions
      const tokens = value.split(/(@[a-zA-Z0-9_]*)/g);
      const isTrailingNewline = value.endsWith("\n");

      let charIndex = 0;

      return (
        <>
          {tokens.map((token, index) => {
            const currentTokenStart = charIndex;
            charIndex += token.length;

            if (token.startsWith("@")) {
              const isActive =
                showPopup && currentTokenStart === mentionStartIndex;
              return (
                <span
                  key={index}
                  ref={isActive ? activeMentionRef : undefined}
                  className="text-blue-500 dark:text-blue-400 bg-blue-500/15"
                >
                  {token}
                </span>
              );
            }
            return <span key={index}>{token}</span>;
          })}
          {isTrailingNewline && "\u200B"}
        </>
      );
    };

    const sharedTypography =
      "w-full font-sans text-sm sm:text-[15px] leading-relaxed tracking-normal p-0 m-0 border-0 outline-none whitespace-pre-wrap break-words overflow-y-auto subtle-scrollbar";

    return (
      <div ref={containerRef} className={`relative w-full ${className}`}>
        {/* Backdrop Highlighting Mirror Layer */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none select-none text-foreground z-0 ${sharedTypography}`}
          style={{ minHeight }}
        >
          {renderBackdropContent()}
        </div>

        {/* The Interactive Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          maxLength={maxLength}
          disabled={disabled}
          rows={rows}
          className={`relative z-10 bg-transparent text-transparent caret-blue-500 selection:bg-blue-500/25 selection:text-blue-900 dark:selection:text-blue-100 resize-none ${sharedTypography}`}
          style={{ minHeight }}
        />

        {/* Floating Autocomplete Mention Popup positioned directly under @ mention */}
        {showPopup && suggestions.length > 0 && (
          <div
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
            }}
            className="absolute w-72 max-w-[calc(100vw-3rem)] max-h-64 overflow-y-auto subtle-scrollbar rounded-2xl border border-border bg-popover dark:bg-card text-popover-foreground ring-1 ring-black/5 dark:ring-white/10 p-1.5 space-y-1 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 border-b border-border/40 mb-1">
              <AtSign className="w-3 h-3 text-blue-500" />
              People matching &ldquo;{mentionQuery}&rdquo;
            </div>

            {suggestions.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent textarea blur
                  handleSelectUser(user);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  index === selectedIndex
                    ? "bg-blue-500/15 border border-blue-500/30 text-foreground"
                    : "hover:bg-accent/60 text-foreground/90 border border-transparent"
                }`}
              >
                {/* User Avatar */}
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border/60 shrink-0">
                  <Image
                    src={user.photo || "/user-placeholder.png"}
                    alt={user.name}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>

                {/* Names */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate">
                    <span className="font-bold text-xs truncate">
                      {user.name}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/15 shrink-0" />
                  </div>
                  <span className="text-[11px] text-blue-500 font-medium truncate">
                    @{user.username}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MentionTextarea.displayName = "MentionTextarea";

export default MentionTextarea;

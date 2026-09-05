"use client";

import Link from "next/link";
import React, { Fragment } from "react";

interface MentionTextProps {
  content?: string | null;
  className?: string;
}

export default function MentionText({ content, className = "" }: MentionTextProps) {
  if (!content) return null;

  // Split text by mentions (@username) while keeping the delimiter
  const parts = content.split(/(@[a-zA-Z0-9_]+)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          return (
            <Link
              key={index}
              href={`/profile`}
              className="text-blue-500 hover:text-blue-600 font-semibold hover:underline transition-colors inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </span>
  );
}

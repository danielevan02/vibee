"use client";

import { User } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";

interface CommentCardProps {
  content: string;
  createdAt: Date;
  author: User;
}

export default function CommentCard({author, content, createdAt}: CommentCardProps) {
  const date = format(new Date(createdAt), "dd MMM, hh:mm aa")
  return (
    <div className="flex items-start gap-2 py-1">
      <Image
        src={author.photo||"/user-placeholder.png"}
        alt="icon"
        height={30}
        width={30}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between max-w-full flex-wrap">
          <p className="font-bold">{author.name}</p>
          <p className="text-foreground/50 text-sm">{date}</p>
        </div>
        <div className="max-w-full flex flex-col">
          <p className="whitespace-pre-wrap break-all">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

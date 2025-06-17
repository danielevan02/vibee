"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../animate-ui/radix/dialog";
import { Comment, Post, User } from "@prisma/client";
import { ChangeEvent, Fragment, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader, SendHorizonal } from "lucide-react";
import CommentCard from "../card/comment-card";
import { WORD_LIMIT } from "@/lib/constants";
import { createComment } from "@/actions/comment.action";
import { toast } from "sonner";

interface CommentSectionProps {
  post: Post & {
    author: User;
    _count: {
      comments: number;
      likes: number;
    };
  };
  words: string[];
  wordLimit: number;
  time: string;
  date: string;
  comments: (Comment & {
    author: User;
  })[];
}

export default function CommentSection({
  post,
  date,
  time,
  words,
  wordLimit,
  comments,
}: CommentSectionProps) {
  const [isExpand, setIsExpand] = useState(false);
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false)
  const showReadMore = words.length > wordLimit;
  const displayedContent =
    showReadMore && !isExpand
      ? words.slice(0, wordLimit).join(" ") + "..."
      : post.content;

  const handleContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setWordCount(text.length);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const {message, status} = await createComment({content, postId: post.id})
      if(status === 201){
        toast.success(message)
      } else {
        toast.error(message)
      }

      setLoading(false)
      setContent("")
      setWordCount(0)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col max-h-[570px] md:max-h-[800px] lg:max-h-[500px] xl:max-h-[700px] overflow-y-scroll">
      <div className="flex justify-between items-center mb-5">
        <div className="flex w-fit gap-2 items-center">
          <Image
            src={post.author.photo || "/user-placeholder.png"}
            height={50}
            width={50}
            alt="icon"
            className="rounded-full w-10 h-fit"
          />
          <div className="flex flex-col justify-center">
            <p className="font-bold">{post.author.name}</p>
            <p className="text-neutral-500 text-sm">@{post.author.username}</p>
          </div>
        </div>
        <div className="w-7 aspect-square">
          <Image
            src={"/black-logo.png"}
            height={50}
            width={50}
            alt="logo icon"
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <p className="whitespace-pre-wrap w-full break-words">
          {displayedContent}{" "}
          {showReadMore && (
            <button
              onClick={() => setIsExpand(!isExpand)}
              className="text-blue-500 hover:underline self-start cursor-pointer"
            >
              {isExpand ? "Show Less" : "Read More"}
            </button>
          )}
        </p>

        {post.imageUrl && (
          <Dialog>
            <DialogTrigger className="cursor-pointer w-fit">
              <Image
                src={post.imageUrl}
                alt="image"
                width={500}
                height={500}
                className="w-[60%] aspect-video object-cover mt-5 rounded-md border"
              />
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <DialogTitle>Image Preview</DialogTitle>
              <Image
                src={post.imageUrl}
                alt="image"
                width={500}
                height={500}
                className="w-full max-h-[700px] object-contain rounded-md"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <p className="text-sm text-neutral-500 my-2">
        {time} • {date}
      </p>

      <div className="flex flex-col w-full">
        <div className="flex flex-col items-end">
          <div className="w-full">
            <Textarea
              className="border resize-none h-28 mt-2 focus-visible:ring-0 border-neutral-300 placeholder:text-neutral-400"
              placeholder="Write a comment here..."
              value={content}
              disabled={loading}
              onChange={handleContent}
              maxLength={WORD_LIMIT}
            />
            <span className="ml-2 text-xs text-foreground/40">
              {wordCount}/{WORD_LIMIT}
            </span>
          </div>
          <Button className="w-fit flex items-center" onClick={handleSubmit}>
            {loading ? (
              <Loader className="animate-spin"/>
            ):(
              <>
                <span>Send</span>
                <SendHorizonal />
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col">
          <p className="text-neutral-500">{post._count.comments} Comments</p>
          <hr className="my-1" />
          <div className="flex flex-col gap-1">
            {
            post._count.comments !== 0 ? (
              comments.map((comment, idx) => (
                <Fragment key={comment.id}>
                  <CommentCard
                    author={comment.author}
                    content={comment.content}
                    createdAt={comment.createdAt}
                  />
                  {(idx+1) !== comments.length && <hr />}
                </Fragment>
              ))

            ):(
              <p className="w-full text-center text-sm text-foreground/60 mt-10 italic">There is no comment, be the first to comment!</p>
            )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { MessageSquareText, Star } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { Post, User } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../animate-ui/radix/dialog";
import { IconButton } from "../animate-ui/buttons/icon";
import { createLike, removeLike } from "@/actions/like.action";
import { toast } from "sonner";

interface PostCardProps {
  post: Post & {
    author: User;
    _count: {
      comments: number;
      likes: number;
    };
  };
  isLiked: boolean;
}

export default function PostCard({ post, isLiked = false }: PostCardProps) {
  const time = format(new Date(post.createdAt), "hh:mm aa");
  const date = format(new Date(post.createdAt), "MMM dd, yyyy");

  const [like, setLike] = useState(post._count.likes);
  const [active, setActive] = useState(isLiked);
  const [isExpand, setIsExpand] = useState(false);

  const content = post.content || "";

  const wordLimit = 20;
  const words = content.split(/\s+/);
  const showReadMore = words.length > wordLimit;
  const displayedContent =
    showReadMore && !isExpand
      ? words.slice(0, wordLimit).join(" ") + "..."
      : content;

  const handleLike = async () => {
    setActive((prev) => !prev);
    setLike((prev) => (active ? prev - 1 : prev + 1));
    try {
      if (!active) {
        const { message } = await createLike({ postId: post.id });
        if(message){
          toast.error(message)
        }
      } else {
        const { message } = await removeLike({ postId: post.id });
        if(message){
          toast.error(message)
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Can't like this post")
    }
  };
  return (
    <div className="rounded-md shadow-2xl p-5 md:p-10 flex flex-col border w-full">
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
            <DialogTrigger className="cursor-pointer">
              <Image
                src={post.imageUrl}
                alt="image"
                width={500}
                height={500}
                className="w-full aspect-video object-cover mt-5 rounded-md border"
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

      <div className="flex mt-5 justify-between items-center">
        <div className="flex gap-6 items-center">
          <div className="flex text-sm items-center text-primary">
            <IconButton
              icon={Star}
              className="text-primary"
              active={active}
              onClick={handleLike}
            />
            {like}
          </div>

          <Dialog>
            <DialogTrigger className="flex gap-2 text-sm items-center hover:bg-primary/10 transition rounded-full px-2 cursor-pointer text-primary">
              <MessageSquareText className="w-5" /> {post._count.comments}
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Comments</DialogTitle>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-sm text-neutral-500">
          {time} • {date}
        </p>
      </div>
    </div>
  );
}

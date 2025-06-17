import { PostCardProps } from "@/components/card/post-card";
import { create } from "zustand";

type PostStore = {
  posts: PostCardProps["post"][];
  setPosts: (
    updater: (prev: PostCardProps["post"][]) => PostCardProps["post"][]
  ) => void;
};

export const usePost = create<PostStore>((set) => ({
  posts: [],
  setPosts: (updater) =>
    set((state) => ({
      posts: updater(state.posts),
    })),
}));

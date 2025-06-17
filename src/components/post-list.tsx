"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostCard from "@/components/card/post-card";
import { Loader } from "lucide-react";

export default function PostList({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef(null);
  
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    fetchPosts(); // skip = 0
  }, []);

  const fetchPosts = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
  
    setLoading(true);
    console.log("Fetching at skip:", posts.length);
  
    try {
      const res = await fetch(`/api/post?skip=${posts.length}`);
      const newPosts = await res.json();
  
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniquePosts = newPosts.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...uniquePosts];
      });
  
      setHasMore(newPosts.length === 10);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [posts.length]);
  

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
  
    observer.current = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !loadingRef.current &&
        hasMoreRef.current
      ) {
        console.log("Intersection triggered at:", posts.length);
        fetchPosts();
      }
    });
  
    if (bottomRef.current) {
      observer.current.observe(bottomRef.current);
    }
  
    return () => observer.current?.disconnect();
  }, [fetchPosts, posts.length]);

  return (
    <>
      {posts.map((post) => {
        const comments = post.comments;
        const isLiked = post.likes.some(
          (like: any) => like.authorId === user?.id
        );
        return (
          <PostCard
            key={post.id}
            post={post}
            isLiked={isLiked}
            comments={comments}
          />
        );
      })}
      {loading && <Loader className="w-5 h-5 animate-spin mt-4 mx-auto" />}
      <div ref={bottomRef} className="h-10" />
    </>
  );
}

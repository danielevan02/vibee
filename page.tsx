"use client"

import { getAllPost, PostWithRelations } from "@/actions/post.action";
import { onAuthenticateUser } from "@/actions/user.action";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents, // Assuming this is your custom component
} from "@/components/animate-ui/components/tabs";
import PostCard from "@/components/card/post-card";
import InputPost from "@/components/input-post";
import { User } from "@prisma/client";
import { Loader } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [user, setUser] = useState<User | undefined>();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(false); // Start as true to indicate initial loading
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const loaderRef = useRef<HTMLDivElement>(null);

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUser = async () => {
      const { user: fetchedUser } = await onAuthenticateUser();
      setUser(fetchedUser || undefined);
    };
    fetchUser();
  }, []);

  const fetchPosts = useCallback(async () => {
    // Prevent fetching if already loading or no more posts are available
    if (!hasMore || loading) {
        console.log("Prevented fetch: hasMore", hasMore, "loading", loading);
        return;
    }

    setLoading(true); // Set loading to true before starting the fetch
    console.log("Fetching posts...");
    try {
      const { posts: fetchedPosts, hasMore: newHasMore } = await getAllPost({
        take: POSTS_PER_PAGE,
        skip: skip,
      });

      console.log("Fetched posts:", fetchedPosts.length, "New hasMore:", newHasMore);

      setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
      setSkip((prevSkip) => prevSkip + fetchedPosts.length);
      setHasMore(newHasMore);

    } catch (error) {
      console.error("Error fetching posts with Server Action:", error);
      setHasMore(false); // Assume no more posts on error
    } finally {
      setLoading(false); // Always set loading to false after the fetch attempt
      console.log("Finished fetching posts. Loading set to false.");
    }
  }, [hasMore, loading, skip]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchPosts();
  }, []); // Add fetchPosts to dependency array

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        // Only fetch if target is intersecting, there are more posts, and not currently loading
        if (target.isIntersecting && hasMore && !loading) {
          console.log("Intersection Observer triggered fetch.");
          fetchPosts();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchPosts, hasMore, loading]); // Dependencies for observer

  return (
    <div className="flex flex-col justify-center w-[90%] md:w-[60%] lg:w-[40%] m-auto flex-1 h-10/12 pb-5">
      <Tabs className="h-full">
        <TabsList className="w-full">
          <TabsTrigger value="tab1">View Post</TabsTrigger>
          <TabsTrigger value="tab2">Write Post</TabsTrigger>
        </TabsList>

        <TabsContents className="relative flex flex-col justify-start h-full overflow-y-scroll hide-scrollbar">
          <TabsContent
            value="tab1"
            className="flex flex-col gap-2 max-h-full overflow-y-scroll"
          >
            {/* Conditional rendering for initial loading */}
            {loading && posts.length === 0 ? (
                <Loader className="w-5 h-5 animate-spin mx-auto mt-20" />
            ) : null}

            {/* Render posts if available */}
            {posts.length > 0 ? (
              posts.map((post, idx) => {
                const isLiked = post.likes.some(like => like.authorId === user?.id)
                return <PostCard key={idx} post={post} isLiked={isLiked} comments={post.comments} />
              })
            ) : ( // Show "no post" message only if not loading and no posts and no more posts expected
              !loading && !hasMore && <p className="mt-20 text-neutral-500 text-center">There are no posts from other users.</p>
            )}

            {/* Loader at the bottom for subsequent loads */}
            <div ref={loaderRef} className="py-4 flex justify-center items-center">
              {loading && posts.length > 0 && <Loader className="w-5 h-5 animate-spin" />}
              {!hasMore && posts.length > 0 && !loading && (
                <p className="text-neutral-500 text-sm">You've reached the end of posts.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tab2" className="sticky top-0 left-0">
            <InputPost user={user} />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}
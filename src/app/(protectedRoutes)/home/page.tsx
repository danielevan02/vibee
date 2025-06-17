import { getAllPost } from "@/actions/post.action";
import { onAuthenticateUser } from "@/actions/user.action";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents, // Asumsi ini komponen custom Anda
} from "@/components/animate-ui/components/tabs";
import PostCard from "@/components/card/post-card";
import InputPost from "@/components/input-post";
import { Loader } from "lucide-react";

export default async function HomePage() {
  const { user } = await onAuthenticateUser();
  const posts = await getAllPost();
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
            {posts ? (
              posts.length !== 0 ? (
                posts.map((post) => {
                  const commments = post.comments
                  const isLiked = post.likes.some(like => like.authorId === user?.id)
                  return <PostCard key={post.id} post={post} isLiked={isLiked} comments={commments} />;
                })
              ) : (
                <p className="mt-20 text-neutral-500">
                  There is no post from other user
                </p>
              )
            ) : (
              <Loader className="w-5 h-5 animate-spin mt-20" />
            )}
          </TabsContent>

          <TabsContent value="tab2" className="sticky top-0 left-0">
            <InputPost user={user} />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}

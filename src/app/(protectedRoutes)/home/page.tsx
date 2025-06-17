import { onAuthenticateUser } from "@/actions/user.action";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents, // Asumsi ini komponen custom Anda
} from "@/components/animate-ui/components/tabs";
import InputPost from "@/components/input-post";
import PostList from "@/components/post-list";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { user } = await onAuthenticateUser();
  if(!user){
    return redirect('/')
  }
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
            <PostList user={user}/>
          </TabsContent>

          <TabsContent value="tab2" className="sticky top-0 left-0">
            <InputPost user={user} />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}
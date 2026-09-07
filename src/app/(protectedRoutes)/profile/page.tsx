import { getCurrentUser } from "@/server/session";
import { redirect } from "next/navigation";

export default async function ProfileIndexPage() {
  const user = await getCurrentUser();
  if (!user || !user.username) {
    redirect("/home");
  }

  redirect(`/profile/${user.username}`);
}

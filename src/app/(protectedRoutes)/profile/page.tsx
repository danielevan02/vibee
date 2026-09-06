import { onAuthenticateUser } from "@/server/data/user";
import { redirect } from "next/navigation";

export default async function ProfileIndexPage() {
  const { user } = await onAuthenticateUser();
  if (!user || !user.username) {
    redirect("/home");
  }

  redirect(`/profile/${user.username}`);
}

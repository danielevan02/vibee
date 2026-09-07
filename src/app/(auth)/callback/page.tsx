import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/server/session";

export default async function CallbackPage() {
  const userId = await getCurrentUserId();
  redirect(userId ? "/home" : "/sign-in");
}
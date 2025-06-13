import { onAuthenticateUser } from "@/actions/user.action";
import { redirect } from "next/navigation";

export default async function CallbackPage(){
  const auth = await onAuthenticateUser()

  if(auth.status === 200 || auth.status === 201){
    redirect('/home')
  } else {
    redirect('/')
  }
}
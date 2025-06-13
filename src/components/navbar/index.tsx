import { onAuthenticateUser } from "@/actions/user.action";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import ThemeButton from "./theme-button";
import Logo from "./logo";

export default async function Navbar(){
  const {user} = await onAuthenticateUser()

  return (
    <nav className="flex px-10 py-5 border-b shadow">
      <div className="flex justify-between w-full">
        <Logo/>
        
        <div className="flex items-center gap-4">
          <ThemeButton/>
          <p className="text-neutral-700 dark:text-neutral-400">@{user?.username}</p>
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
import { onAuthenticateUser } from "@/actions/user.action";
import { UserButton } from "@clerk/nextjs";
import ThemeButton from "./theme-button";
import Logo from "./logo";

export default async function Navbar(){
  const {user} = await onAuthenticateUser()

  return (
    <nav className="sticky top-0 z-10 flex px-5 py-5 md:px-10 border-b shadow mb-5 backdrop-blur-lg h-1/12">
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
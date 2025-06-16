import Navbar from "@/components/navbar";

export default async function ProtectedLayout({children}: {children: React.ReactNode}){
  return (
    <main className="relative flex flex-col h-screen w-screen">
      <Navbar/>
      {children}
    </main>
  )
}
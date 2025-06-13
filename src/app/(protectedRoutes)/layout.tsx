import Navbar from "@/components/navbar";

export default async function ProtectedLayout({children}: {children: React.ReactNode}){
  return (
    <main>
      <Navbar/>
      {children}
    </main>
  )
}
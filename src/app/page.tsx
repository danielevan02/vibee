import DemoVideo from "@/components/demo-video";
import ParallaxSection from "@/components/section/parallax-section";
import WorldSection from "@/components/section/world-section";
import { Button } from "@/components/ui/button";
import ColourfulText from "@/components/ui/colourful-text";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col mx-5 md:mx-10">
      <div className="relative flex items-center justify-center h-screen">
        <div className="w-[90%] xl:w-[70%] m-auto flex flex-col lg:flex-row items-center gap-5">
          <div className="flex flex-col justify-between h-full gap-5 items-center">
            <p className="italic">"Share the Vibe. Live the Moment."</p>
            <h1 className="text-3xl md:text-5xl capitalize font-extrabold text-center">
              <ColourfulText text="VIBEE" /> The best social media app for gen-z
            </h1>
            <p className="text-sm">
              Vibee is where your real moments turn into real vibes. Share,
              connect, and vibe with your people—anytime, anywhere.
            </p>
            <Link href='/home' className="rounded-full px-8 py-4 border border-primary text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition">
              join vibee now
            </Link>
          </div>

          <div className="rounded-md overflow-clip shadow-lg border w-full h-full">
            <video autoPlay loop muted playsInline className="w-full h-full">
              <source src="/video.mp4" type="video/mp4"/>
            </video>
          </div>
        </div>

        <Link
          href="#world"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full hover:bg-neutral-400 transition p-2 animate-bounce"
        >
          <ChevronDown />
        </Link>
      </div>

      <section id="world" className="pt-10">
        <WorldSection />
      </section>

      <section>
        <ParallaxSection />
      </section>

      <section className="relative flex h-96 w-full items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        {/* Radial gradient for the container to give a faded look */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
        <div className="relative z-20 flex flex-col items-center">
          <p className="bg-gradient-to-b from-neutral-200 to-primary bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl text-center">
            What are you waiting for? <br />
            <span className="text-lg md:text-3xl text-foreground/60">join now and start connecting with your people!</span>
          </p>
          <Button className="p-5 uppercase tracking-widest bg-transparent border border-primary backdrop-blur-sm text-primary hover:text-white">Join Our Community</Button>
        </div>
      </section>

      <footer className="flex justify-center items-center border-t">
        <p className="text-neutral-600">© {new Date().getFullYear()} VIBEE, made by Daniel Evan</p>
      </footer>
    </div>
  );
}

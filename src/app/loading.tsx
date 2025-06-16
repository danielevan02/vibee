"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center gap-2 w-screen h-screen">
      <div className="w-10 aspect-square">
        {mounted ? (
          <Image
            src={theme === "light" ? "/black-logo.png" : "/white-logo.png"}
            width={300}
            height={300}
            alt="VIBEE Logo"
            className="w-full h-full"
          />
        ) : (
          <Image
            src="/black-logo.png"
            width={300}
            height={300}
            alt="VIBEE Logo"
            className="w-full h-full"
          />
        )}
      </div>
      <p className="tracking-widest">VIBEE</p>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
        <p className="text-neutral-500">Made by</p>
        <p className="font-extrabold text-lg bg-gradient-to-br text-transparent from-blue-900 via-blue-400 to-blue-200 bg-clip-text">Daniel Evan</p>
      </div>
    </div>
  );
}

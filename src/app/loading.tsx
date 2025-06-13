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
    <div className="flex flex-col items-center justify-center gap-5 w-screen h-screen">
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
    </div>
  );
}

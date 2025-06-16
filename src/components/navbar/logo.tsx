'use client'

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Logo() {
  const {theme} = useTheme()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-1 md:gap-3">
      {mounted ? (
        <Image
          src={theme === 'light' ? "/black-logo.png":"/white-logo.png"}
          width={200}
          height={200}
          alt="VIBEE"
          className="w-8 h-8 md:w-10 md:h-10"
        />
      ):(
        <Image
          src="/black-logo.png"
          width={200}
          height={200}
          alt="VIBEE"
          className="w-8 h-8 md:w-10 md:h-10"
        />
      )}
      <p className="text-lg md:text-2xl bg-gradient-to-r bg-clip-text text-transparent from-blue-800 via-blue-400 to-blue-100">
        VIBEE
      </p>
    </div>
  );
}

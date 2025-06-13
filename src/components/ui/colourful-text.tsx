"use client";

import React from "react";
import { motion } from "motion/react";

export default function ColourfulText({ text }: { text: string; }) {
  const colors = [
    "rgb(173, 216, 230)",  // LightBlue
    "rgb(135, 206, 250)",  // LightSkyBlue
    "rgb(0, 191, 255)",    // DeepSkyBlue
    "rgb(30, 144, 255)",   // DodgerBlue
    "rgb(70, 130, 180)",   // SteelBlue
    "rgb(0, 0, 255)",      // Blue
    "rgb(65, 105, 225)",   // RoyalBlue
    "rgb(25, 25, 112)",    // MidnightBlue
    "rgb(0, 0, 139)",      // DarkBlue
    "rgb(100, 149, 237)"   // CornflowerBlue
  ]

  const [currentColors, setCurrentColors] = React.useState(colors);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      setCurrentColors(shuffled);
      setCount((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [colors]);

  return text.split("").map((char, index) => (
    <motion.span
      key={`${char}-${count}-${index}`}
      initial={{
        y: 0,
      }}
      animate={{
        color: currentColors[index % currentColors.length],
        y: [0, -3, 0],
        scale: [1, 1.01, 1],
        filter: ["blur(0px)", `blur(5px)`, "blur(0px)"],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
      }}
      className="inline-block whitespace-pre font-sans tracking-tight text-7xl"
    >
      {char}
    </motion.span>
  ));
}

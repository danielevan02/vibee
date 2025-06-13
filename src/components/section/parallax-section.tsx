import { HeroParallax } from "../ui/hero-parallax";

export default function ParallaxSection(){
  const products = [
    {
      title: "Moonbeam",
      link: "https://gomoonbeam.com",
      thumbnail: "/parallax1.png"
    },
    {
      title: "Cursor",
      link: "https://cursor.so",
      thumbnail: "/parallax2.png"
    },
    {
      title: "Rogue",
      link: "https://userogue.com",
      thumbnail: "/parallax3.png"
    },
   
    {
      title: "Editorially",
      link: "https://editorially.org",
      thumbnail: "/parallax4.png"
    },
    {
      title: "Editrix AI",
      link: "https://editrix.ai",
      thumbnail: "/parallax5.png"
    },
    {
      title: "Pixel Perfect",
      link: "https://app.pixelperfect.quest",
      thumbnail: "/parallax6.png"
    },
   
    {
      title: "Algochurn",
      link: "https://algochurn.com",
      thumbnail: "/parallax7.png"
    },
    {
      title: "Aceternity UI",
      link: "https://ui.aceternity.com",
      thumbnail: "/parallax8.png"
    },
    {
      title: "Tailwind Master Kit",
      link: "https://tailwindmasterkit.com",
      thumbnail: "/parallax9.png"
    },
    {
      title: "SmartBridge",
      link: "https://smartbridgetech.com",
      thumbnail: "/parallax10.png"
    },
    {
      title: "Renderwork Studio",
      link: "https://renderwork.studio",
      thumbnail:"/parallax11.png"
    },
   
    {
      title: "Creme Digital",
      link: "https://cremedigital.com",
      thumbnail: "/parallax12.png"
    },
    {
      title: "Golden Bells Academy",
      link: "https://goldenbellsacademy.com",
      thumbnail:"/parallax13.png"
    },
    {
      title: "Invoker Labs",
      link: "https://invoker.lol",
      thumbnail:"/parallax14.png"
    },
    {
      title: "E Free Invoice",
      link: "https://efreeinvoice.com",
      thumbnail:"/parallax15.png"
    },
  ]
  return (
    <HeroParallax products={products}/>
  )
}
import LandingNavbar from "@/components/features/landing/landing-navbar";
import HeroSection from "@/components/features/landing/hero-section";
import TrendingTicker from "@/components/features/landing/trending-ticker";
import FeaturesBento from "@/components/features/landing/features-bento";
import AppPreview from "@/components/features/landing/app-preview";
import ContrastQuietSection from "@/components/features/landing/contrast-quiet-section";
import TestimonialsSection from "@/components/features/landing/testimonials-section";
import CTASection from "@/components/features/landing/cta-section";
import LandingFooter from "@/components/features/landing/landing-footer";
import ProgressiveBottomBlur from "@/components/features/landing/progressive-blur";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">

      {/* Top Navbar */}
      <LandingNavbar />

      {/* Main Containerized Editorial Layout with Framed Side Borders */}
      <div className="max-w-[1240px] mx-auto border-x border-border/60 bg-background/50">
        <main className="relative z-10 flex flex-col">
          {/* 1. Split Editorial Hero with Classical Oil Painting Backdrop */}
          <HeroSection />

          {/* 2. Dark Editorial Frequency Ribbon */}
          <TrendingTicker />

          {/* 3. Three Steps Between You and Genuine Connection (3 Painting Cards) */}
          <FeaturesBento />

          {/* 4. Panoramic Canvas Showcase (Interactive Feed on European Countryside) */}
          <AppPreview />

          {/* 5. Signature Obsidian Dark Block: "Built for humans, not dopamine algorithms" */}
          <ContrastQuietSection />

          {/* 6. Literary Pull-Quote Testimonial with Painted Portrait */}
          <TestimonialsSection />

          {/* 7. Panoramic Banner CTA with Handle Claim */}
          <CTASection />
        </main>

        {/* 8. Minimalist Editorial Footer with Painted Strip */}
        <LandingFooter />
      </div>

      {/* Fixed Progressive Bottom Edge Fog Blur */}
      <ProgressiveBottomBlur />
    </div>
  );
}

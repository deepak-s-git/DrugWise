'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Pillpit from '@/components/ui/Pillpit';
import ScrollExpand from '@/components/ui/scroll-expand';
import ShinyText from '@/components/ui/shiny-text';
import { InfinityTrack } from "@/components/loading-ui/infinity-track";
import { HeroSearch } from '@/components/search/HeroSearch';
import { MedicineShowcaseCard } from '@/components/home/MedicineShowcaseCard';
import { WorkflowSteps } from '@/components/home/WorkflowSteps';
import { Footer } from "@/components/layout/Footer";
import { Disclaimer } from "@/components/layout/Disclaimer";

export default function HomePage() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(800);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    
    // Give hydration time to complete and show off the loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const scrollEnd = windowHeight * 1.2;
  // Animate from center of screen (approx +120px down) to a comfortable top position (-20px)
  const titleY = useTransform(scrollY, [0, scrollEnd], [120, -20]);

  // Animate from slightly lower to its final resting position (0px)
  const contentOpacity = useTransform(scrollY, [scrollEnd * 0.3, scrollEnd * 0.8], [0, 1]);
  const contentY = useTransform(scrollY, [scrollEnd * 0.3, scrollEnd * 0.8], [80, 0]);

  return (
    <>
      {/* ── Global Loading Screen (Hides SSR Glitch) ── */}
      <div 
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700 pointer-events-none ${
          isLoading ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <InfinityTrack />
      </div>

      {/* ── SECTION 1: Hero ── */}
      <section className="relative min-h-[200vh] border-b border-outline-variant bg-background">

        <ScrollExpand
          scrollHint="Scroll to expand"
          useWindowScroll={true}
          mediaType="custom"
        >
          {/* The Hero Section is now the media that gets revealed through the gap */}
          <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Background Pillpit */}
            <div className="absolute inset-0 z-0 opacity-50 mix-blend-multiply pointer-events-none">
              <Pillpit
                count={120}
                gravity={0}
                friction={0.995}
                wallBounce={0.95}
                followCursor={false}
                colors={[0x2D3142, 0x4F5D75, 0xBFC0C0, 0xEF8354, 0x059669, 0xDC2626]}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-[800px] mx-auto px-[16px] md:px-[32px] text-center flex flex-col items-center">
              <motion.h1
                style={{ y: titleY }}
                className="font-sans text-[100px] md:text-[140px] leading-[0.8] font-black tracking-wide text-primary uppercase mb-[60px] md:mb-[80px] drop-shadow-sm"
              >
                <ShinyText text="DRUGWISE" color="#050505" shineColor="#059669" speed={3} />
              </motion.h1>

              <motion.div
                style={{ opacity: contentOpacity, y: contentY }}
                className="flex flex-col items-center w-full"
              >
                <div className="space-y-[16px] mb-[40px]">
                  <h2 className="text-display-lg text-on-surface">
                    Clinical intelligence, instantly.
                  </h2>
                  <p className="text-body-lg text-on-surface-variant max-w-[600px] mx-auto">
                    Access structured, normalized clinical data for thousands of medicines. Understand indications, side effects, and active ingredients instantly.
                  </p>
                </div>

                <div className="w-full flex justify-center">
                  <HeroSearch />
                </div>
              </motion.div>
            </div>
          </div>
        </ScrollExpand>
      </section >

      {/* ── SECTION 2: Premium Medicine Showcase ── */}
      < MedicineShowcaseCard />

      {/* ── SECTION 3: How MediLens Works ── */}
      < WorkflowSteps />

      <Footer />
      <Disclaimer />
    </>
  );
}

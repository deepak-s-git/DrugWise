'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Pillpit from '@/components/ui/Pillpit';
import ScrollExpand from '@/components/ui/scroll-expand';
import ShinyText from '@/components/ui/shiny-text';
import { HeroSearch } from '@/components/search/HeroSearch';
import { MedicineShowcaseCard } from '@/components/home/MedicineShowcaseCard';
import { WorkflowSteps } from '@/components/home/WorkflowSteps';
import { Footer } from "@/components/layout/Footer";
import { Disclaimer } from "@/components/layout/Disclaimer";

export default function HomePage() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(800);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollEnd = windowHeight * 1.2;
  // Animate from center of screen (+195px down to fit perfectly in the slit) to a comfortable top position (-20px)
  const titleY = useTransform(scrollY, [0, scrollEnd], [188, -20]);

  // Animate from slightly lower to its final resting position (0px)
  const contentOpacity = useTransform(scrollY, [scrollEnd * 0.3, scrollEnd * 0.8], [0, 1]);
  const contentY = useTransform(scrollY, [scrollEnd * 0.3, scrollEnd * 0.8], [80, 0]);

  return (
    <>
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
            <div className="relative z-10 max-w-[50rem] mx-auto px-4 md:px-8 text-center flex flex-col items-center">
              <motion.h1
                style={{ y: titleY }}
                className="font-sans text-[6.25rem] md:text-[8.75rem] leading-[0.8] font-black tracking-wide text-primary uppercase mb-[3.75rem] md:mb-[5rem] drop-shadow-sm"
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

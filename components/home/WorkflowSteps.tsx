'use client';

import { Search, ScanLine, Activity } from 'lucide-react';
import Carousel from '@/components/ui/Carousel';

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: 'Search',
    description: 'Query by trade name, generic ingredient, or manufacturer across our normalized dataset.',
    icon: <Search className="carousel-icon" />
  },
  {
    id: 2,
    title: 'Identify',
    description: 'Match visual or textual queries to canonical medical entities and physical product data.',
    icon: <ScanLine className="carousel-icon" />
  },
  {
    id: 3,
    title: 'Understand',
    description: 'Review structured monographs covering indications, dosages, and contraindications.',
    icon: <Activity className="carousel-icon" />
  },
];

export function WorkflowSteps() {
  return (
    <section className="py-[120px] px-[16px] md:px-[32px] bg-background border-y border-outline-variant overflow-hidden">
      <div className="max-w-[1280px] mx-auto w-full flex flex-col items-center space-y-[64px]">
        {/* Header */}
        <div className="text-center space-y-[24px]">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
            How DrugWise Works
          </h2>
          <p className="text-lg md:text-xl text-on-surface-variant">
            A streamlined clinical workflow designed for clarity.
          </p>
        </div>

        {/* Carousel */}
        <div className="w-full flex justify-center">
          <Carousel
            items={WORKFLOW_STEPS}
            baseWidth={380}
            autoplay={true}
            autoplayDelay={5000}
            pauseOnHover={true}
            loop={true}
            round={false}
          />
        </div>
      </div>
    </section>
  );
}

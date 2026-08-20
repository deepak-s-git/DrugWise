'use client';

import { Info } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CardSwap, { Card } from '@/components/ui/CardSwap';

gsap.registerPlugin(ScrollTrigger);

const MEDICINES = [
  {
    id: 'MED_02242ad465279b81',
    name: 'Cetzine',
    type: 'Tablets',
    composition: 'Cetirizine 10 mg',
    uses: 'Allergic conditions, Runny nose, Sneezing, Itching.',
    sideEffects: ['Sleepiness', 'Dry Mouth', 'Headache'],
    interactions: { item: 'Alcohol', risk: 'May increase drowsiness. Avoid concurrent use.' }
  },
  {
    id: 'MED_PARA500',
    name: 'Paracetamol',
    type: 'Tablets',
    composition: 'Paracetamol 500 mg',
    uses: 'Fever, Mild to moderate pain relief.',
    sideEffects: ['Nausea', 'Stomach Pain', 'Rash'],
    interactions: { item: 'Warfarin', risk: 'May increase risk of bleeding with prolonged use.' }
  },
  {
    id: 'MED_DOLO650',
    name: 'Dolo 650',
    type: 'Tablets',
    composition: 'Paracetamol 650 mg',
    uses: 'High Fever, Body Ache, Headache.',
    sideEffects: ['Liver toxicity (in overdose)', 'Nausea'],
    interactions: { item: 'Alcohol', risk: 'Significantly increases risk of liver damage.' }
  }
];

export function MedicineShowcaseCard() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    
    gsap.fromTo(
      textRef.current.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, []);

  return (
    <section className="py-[80px] md:py-[100px] px-[16px] md:px-[32px] max-w-[1280px] mx-auto w-full flex items-center overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[64px] items-center w-full">
        {/* Left: Text */}
        <div className="md:col-span-5 space-y-[32px]" ref={textRef}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-primary">
            From a name to everything you need to know.
          </h2>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
            Instant access to structured, normalized clinical data. Understand
            indications, contraindications, and active pharmaceutical ingredients
            without deciphering complex medical jargon.
          </p>
        </div>

        {/* Right: CardSwap */}
        <div className="md:col-span-7 h-[600px] relative w-full flex items-center justify-center">
          <CardSwap width="100%" height={480} delay={4000} cardDistance={40} verticalDistance={25}>
            {MEDICINES.map((med) => (
              <Card key={med.id} className="w-full max-w-[580px] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="p-[32px] border-b border-outline-variant flex justify-between items-start bg-surface-bright">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">{med.name}</h3>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
                        {med.type}
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="text-mono-data bg-secondary/10 text-secondary px-2 py-0.5 rounded border border-secondary/20 whitespace-nowrap">
                        {med.composition}
                      </span>
                    </div>
                  </div>
                  <Info size={20} className="text-outline-variant shrink-0" />
                </div>

                <div className="p-[32px] space-y-[32px] bg-surface-container-lowest h-full">
                  <div>
                    <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 border-b border-surface-container pb-1">
                      Primary Uses
                    </h4>
                    <p className="text-body-sm text-on-surface">{med.uses}</p>
                  </div>

                  <div>
                    <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 border-b border-surface-container pb-1">
                      Common Side Effects
                    </h4>
                    <div className="flex gap-[8px] flex-wrap">
                      {med.sideEffects.map((effect) => (
                        <span
                          key={effect}
                          className="border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface bg-surface"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-label-md text-error uppercase tracking-wider mb-2 border-b border-surface-container pb-1">
                      Key Interactions
                    </h4>
                    <p className="text-body-sm text-on-surface">
                      <span className="font-semibold">{med.interactions.item}:</span> {med.interactions.risk}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
    </section>
  );
}

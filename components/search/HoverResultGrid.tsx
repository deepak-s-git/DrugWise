'use client';

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types";
import { ResultCard } from "./ResultCard";

export const HoverResultGrid = ({
  results,
  className,
}: {
  results: SearchResult[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-0",
        className
      )}
    >
      {results.map((result, idx) => (
        <div
          key={result?.medicine_id}
          className="relative group block p-[12px] h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-[#111] block rounded-[28px]"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { type: "spring", stiffness: 200, damping: 25 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.2, delay: 0.05 },
                }}
              />
            )}
          </AnimatePresence>
          {/* Ensure the card is above the animated background */}
          <div className="relative z-10 h-full">
            <ResultCard result={result} index={idx} />
          </div>
        </div>
      ))}
    </div>
  );
};

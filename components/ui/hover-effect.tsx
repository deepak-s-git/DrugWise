'use client';

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
  renderItem,
}: {
  items: any[];
  className?: string;
  renderItem: (item: any, index: number) => React.ReactNode;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("flex flex-col py-1 space-y-1", className)}>
      {items.map((item, idx) => (
        <div
          key={item?.id || idx}
          className="relative group block px-2 py-1.5 rounded-lg transition-colors"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-secondary/10 dark:bg-secondary/20 block rounded-lg z-0"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10">
            {renderItem(item, idx)}
          </div>
        </div>
      ))}
    </div>
  );
};

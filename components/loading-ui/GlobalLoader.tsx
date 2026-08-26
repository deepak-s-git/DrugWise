'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { InfinityTrack } from "@/components/loading-ui/infinity-track";

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    // Whenever the route changes (or on first load), trigger the loading animation
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Same 800ms duration as before

    return () => clearTimeout(timer);
  }, [pathname]);

  // Once loading is fully finished and the fade out is done, we can remove it from DOM
  // But to keep it simple and match the old behavior, we just use opacity and pointer-events-none
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background pointer-events-none transition-opacity ${
        isLoading ? 'opacity-100 duration-0' : 'opacity-0 duration-700'
      }`}
    >
      <InfinityTrack />
    </div>
  );
}

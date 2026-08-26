'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { InfinityTrack } from "@/components/loading-ui/infinity-track";

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700 pointer-events-none ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <InfinityTrack />
    </div>
  );
}

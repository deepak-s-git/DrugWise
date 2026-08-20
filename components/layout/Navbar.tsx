'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User } from 'lucide-react';
import PillNav from '@/components/ui/PillNav';

const NAV_LINKS = [
  { href: '/', label: 'Explore' },
  { href: '/scan', label: 'Scan' },
  { href: '/compare', label: 'Compare' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (pathname !== '/') {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      // Reveal navbar after scrolling down sufficiently to expand the hero section
      if (window.scrollY > window.innerHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-[32px] flex items-center justify-center h-24">
        <PillNav 
           items={NAV_LINKS} 
           activeHref={pathname} 
           logo="" 
           logoAlt="DW" 
           baseColor="#059669" 
           pillColor="#ffffff"
           pillTextColor="#059669"
           hoveredPillTextColor="#ffffff"
        />
      </div>
    </header>
  );
}

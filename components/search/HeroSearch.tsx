'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const POPULAR_MEDICINES = [
  { name: 'Cetzine', query: 'Cetzine' },
  { name: 'Dolo 650', query: 'Dolo 650' },
  { name: 'Pantoprazole', query: 'Pantoprazole' },
  { name: 'Augmentin 625', query: 'Augmentin 625' },
  { name: 'Paracetamol', query: 'Paracetamol' },
];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  const handlePopularClick = useCallback(
    (q: string) => {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [router]
  );

  return (
    <div className="w-full max-w-[40rem] space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative group">
        <Search
          size={24}
          className="absolute left-6 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-full py-4 pl-16 pr-6 text-body-lg shadow-sm focus:outline-none focus:border-secondary focus:ring-0 transition-colors duration-300 spring-ease placeholder:text-outline"
          placeholder="Search a medicine or symptom..."
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
          <kbd className="text-mono-data bg-surface-container py-1 px-2 rounded text-on-surface-variant border border-outline-variant text-xs">
            ⌘K
          </kbd>
        </div>
      </form>

      {/* Popular Links */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 px-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/50 text-xs font-semibold text-on-surface-variant uppercase tracking-widest shadow-sm select-none">
          <TrendingUp size={14} className="text-secondary" />
          <span>Trending</span>
        </div>
        {POPULAR_MEDICINES.map((med) => (
          <button
            key={med.name}
            onClick={() => handlePopularClick(med.query)}
            className="px-4 py-1.5 rounded-full border border-outline-variant bg-surface-container-lowest text-body-sm font-medium text-on-surface hover:border-secondary hover:bg-secondary hover:text-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-[2px]"
          >
            {med.name}
          </button>
        ))}
      </div>
    </div>
  );
}

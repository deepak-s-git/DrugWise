'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense, useMemo } from 'react';
import { Search } from 'lucide-react';
import { searchMedicines } from '@/lib/api';
import type { SearchResponse, SearchResult } from '@/types';
import { ResultCard } from '@/components/search/ResultCard';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { HoverResultGrid } from '@/components/search/HoverResultGrid';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState<string | undefined>();
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({});
  const [sortOption, setSortOption] = useState('relevance');

  const filteredResults = useMemo(() => {
    if (!results || results.length === 0) return [];
    
    const filtered = results.filter((res) => {
      // Composition filter
      if (activeFilters['Composition']?.size > 0) {
        const hasMatch = Array.from(activeFilters['Composition']).some(f => res.composition?.toLowerCase().includes(f.toLowerCase()));
        if (!hasMatch) return false;
      }
      // Dosage Form filter
      if (activeFilters['Dosage Form']?.size > 0) {
        const hasMatch = Array.from(activeFilters['Dosage Form']).some(f => 
          res.formulations.some(form => form.dosage_form?.toLowerCase().includes(f.toLowerCase()))
        );
        if (!hasMatch) return false;
      }
      // Strength filter
      if (activeFilters['Strength']?.size > 0) {
        const hasMatch = Array.from(activeFilters['Strength']).some(f => 
          res.formulations.some(form => form.strength?.toLowerCase().includes(f.toLowerCase()))
        );
        if (!hasMatch) return false;
      }
      return true;
    });

    if (sortOption === 'name-asc') {
      filtered.sort((a, b) => a.canonical_name.localeCompare(b.canonical_name));
    } else if (sortOption === 'name-desc') {
      filtered.sort((a, b) => b.canonical_name.localeCompare(a.canonical_name));
    }

    return filtered;
  }, [results, activeFilters, sortOption]);

  const performSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await searchMedicines(q, p, 12);
      setResults(data.results);
      setTotal(data.total);
      setCorrectedQuery(data.corrected_query);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery, 1);
    }
  }, [initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim(), 1);
      setPage(1);
    }
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-[32px] pt-[120px] pb-[40px] w-full">
      <div className="flex gap-[24px]">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-[240px] shrink-0">
          <FilterSidebar results={results} onFilterChange={setActiveFilters} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative mb-[24px]">
            <Search
              size={20}
              className="absolute left-[16px] top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-12 pr-16 text-body-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors duration-300 spring-ease placeholder:text-outline"
              placeholder="Search medicines..."
              autoComplete="off"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-data bg-surface-container py-1 px-2 rounded text-on-surface-variant border border-outline-variant text-xs pointer-events-none">
              ⌘K
            </kbd>
          </form>

          {/* Corrected Query Banner */}
          {correctedQuery && (
            <p className="text-body-sm text-on-surface-variant mb-4">
              Showing results for{' '}
              <span className="font-semibold text-secondary">{correctedQuery}</span>
            </p>
          )}

          {/* Results Count + Sort */}
          {!loading && total > 0 && (
            <div className="flex items-center justify-between mb-[24px]">
              <p className="text-body-sm text-on-surface-variant">
                Showing <span className="font-semibold text-on-surface">{filteredResults.length}</span> results
              </p>
              <div className="flex items-center gap-2 text-body-sm">
                <label htmlFor="sort-select" className="text-on-surface-variant">Sort by</label>
                <select
                  id="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-md px-2 py-1 text-on-surface font-medium focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer"
                >
                  <option value="relevance">Clinical Relevance</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="clinical-card p-[24px] animate-pulse"
                >
                  <div className="h-6 bg-surface-container-high rounded w-3/4 mb-3" />
                  <div className="h-4 bg-surface-container-high rounded w-1/2 mb-6" />
                  <div className="h-4 bg-surface-container-high rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Results Grid */}
          {!loading && filteredResults.length > 0 && (
            <HoverResultGrid results={filteredResults} />
          )}

          {/* Empty State */}
          {!loading && filteredResults.length === 0 && initialQuery && (
            <div className="text-center py-[64px]">
              <p className="text-headline-md text-on-surface-variant mb-2">No results found</p>
              <p className="text-body-md text-outline">Try adjusting your search terms.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-[40px]">
              <button
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  setPage(newPage);
                  performSearch(query, newPage);
                }}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setPage(pageNum);
                      performSearch(query, pageNum);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-body-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-outline-variant px-1">…</span>
                  <button
                    onClick={() => {
                      setPage(totalPages);
                      performSearch(query, totalPages);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-body-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  const newPage = Math.min(totalPages, page + 1);
                  setPage(newPage);
                  performSearch(query, newPage);
                }}
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30 transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1280px] mx-auto px-4 md:px-[32px] pt-[120px] pb-[40px] text-center">
        <div className="animate-pulse h-12 bg-surface-container-high rounded-xl w-full max-w-[640px] mx-auto" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

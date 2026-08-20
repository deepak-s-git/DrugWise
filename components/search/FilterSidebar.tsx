'use client';

import { useState, useMemo } from 'react';
import type { SearchResult } from '@/types';

export function FilterSidebar({
  results = [],
  onFilterChange,
}: {
  results?: SearchResult[];
  onFilterChange?: (filters: Record<string, Set<string>>) => void;
}) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({
    Composition: new Set(),
    'Dosage Form': new Set(),
    Strength: new Set(),
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filterGroups = useMemo(() => {
    if (!results || results.length === 0) return [];

    const compCounts: Record<string, number> = {};
    const dosageForms = new Set<string>();
    const strengths = new Set<string>();

    results.forEach((r) => {
      if (r.composition) {
        compCounts[r.composition] = (compCounts[r.composition] || 0) + 1;
      }
      r.formulations.forEach((f) => {
        if (f.dosage_form) dosageForms.add(f.dosage_form);
        if (f.strength) strengths.add(f.strength);
      });
    });

    const groups = [];

    if (Object.keys(compCounts).length > 0) {
      groups.push({
        title: 'Composition',
        type: 'checkbox' as const,
        options: Object.entries(compCounts)
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count),
      });
    }

    if (dosageForms.size > 0) {
      groups.push({
        title: 'Dosage Form',
        type: 'checkbox' as const,
        options: Array.from(dosageForms)
          .sort((a, b) => {
            if (a === 'Tablet' && b !== 'Tablet') return -1;
            if (b === 'Tablet' && a !== 'Tablet') return 1;
            if (a === 'Other' && b !== 'Other') return 1;
            if (b === 'Other' && a !== 'Other') return -1;
            return a.localeCompare(b);
          })
          .map((label) => ({ label })),
      });
    }

    if (strengths.size > 0) {
      groups.push({
        title: 'Strength',
        type: 'pill' as const,
        options: Array.from(strengths)
          .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
          })
          .map((label) => ({ label })),
      });
    }

    return groups;
  }, [results]);

  const toggleFilter = (group: string, value: string) => {
    const next = { ...selected };
    const set = new Set(next[group] || []);
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
    next[group] = set;
    
    setSelected(next);
    if (onFilterChange) {
      onFilterChange(next);
    }
  };

  if (filterGroups.length === 0) return null;

  return (
    <div className="space-y-6">
      {filterGroups.map((group) => {
        const isExpanded = expanded[group.title] || false;
        
        return (
          <div key={group.title}>
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
              {group.title}
            </h3>

            {group.type === 'checkbox' && (
              <div className="space-y-2">
                {group.options.slice(0, isExpanded ? undefined : 5).map((opt) => {
                  const isChecked = selected[group.title]?.has(opt.label) || false;
                  return (
                    <label
                      key={opt.label}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilter(group.title, opt.label)}
                          className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
                        />
                        <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">
                          {opt.label}
                        </span>
                      </div>
                      {opt.count && (
                        <span className="text-body-sm text-outline">
                          {opt.count >= 1000 ? `${(opt.count / 1000).toFixed(1)}k` : opt.count}
                        </span>
                      )}
                    </label>
                  );
                })}
                {group.options.length > 5 && (
                  <button 
                    onClick={() => setExpanded({ ...expanded, [group.title]: !isExpanded })}
                    className="text-body-sm text-secondary hover:underline mt-1 text-left block"
                  >
                    {isExpanded ? 'View less' : 'View all'}
                  </button>
                )}
              </div>
            )}

            {group.type === 'pill' && (
              <div className="flex flex-wrap gap-2">
                {group.options.slice(0, isExpanded ? undefined : 8).map((opt) => {
                  const isActive = selected[group.title]?.has(opt.label) || false;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => toggleFilter(group.title, opt.label)}
                      className={`px-3 py-1.5 rounded-full text-body-sm border transition-colors ${
                        isActive
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-secondary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                {group.options.length > 8 && (
                  <button 
                    onClick={() => setExpanded({ ...expanded, [group.title]: !isExpanded })}
                    className="px-3 py-1.5 rounded-full text-body-sm border border-transparent text-secondary hover:bg-secondary/10 transition-colors"
                  >
                    {isExpanded ? 'Less' : 'More +'}
                  </button>
                )}
              </div>
            )}

            <div className="border-b border-outline-variant mt-4" />
          </div>
        );
      })}
    </div>
  );
}

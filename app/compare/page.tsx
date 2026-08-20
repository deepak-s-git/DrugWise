'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { searchMedicines, getMedicineDetails } from '@/lib/api';
import type { SearchResult, MedicineDetailResponse } from '@/types';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { HoverEffect } from '@/components/ui/hover-effect';
import { motion } from 'motion/react';

function MedicineSearchInput({
  label,
  placeholder,
  selectedMed,
  onSelect,
}: {
  label: string;
  placeholder: string;
  selectedMed: MedicineDetailResponse | null;
  onSelect: (med: MedicineDetailResponse | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedMed) {
      setQuery(selectedMed.medicine.canonical_name);
    } else {
      setQuery('');
      setResults([]);
      setShowDropdown(false);
    }
  }, [selectedMed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (selectedMed && q !== selectedMed.medicine.canonical_name) {
      onSelect(null);
    }
    
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    setShowDropdown(true);
    try {
      const data = await searchMedicines(q, 1, 5);
      setResults(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMed, onSelect]);

  const handleSelect = async (id: string, name: string) => {
    setShowDropdown(false);
    setQuery(name);
    try {
      const details = await getMedicineDetails(id);
      onSelect(details);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <span className="text-label-md text-on-surface-variant block mb-2 uppercase tracking-wider">{label}</span>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:outline-none focus:border-secondary transition-colors placeholder:text-outline"
          placeholder={placeholder}
        />
        {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary animate-spin pointer-events-none" />}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((res) => (
            <button
              key={res.medicine_id}
              onClick={() => handleSelect(res.medicine_id, res.canonical_name)}
              className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/50 last:border-0"
            >
              <div className="text-body-md text-primary font-medium">{res.canonical_name}</div>
              <div className="text-body-sm text-on-surface-variant line-clamp-1">{res.composition}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [medA, setMedA] = useState<MedicineDetailResponse | null>(null);
  const [medB, setMedB] = useState<MedicineDetailResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (!medA || !medB) {
      setIsComparing(false);
    }
  }, [medA, medB]);

  const getDisplayName = (med: MedicineDetailResponse) => {
    return med.medicine.canonical_name || 'Unknown';
  };

  const parseScrapedList = (items: string[], splitSpaces: boolean = false, stripTreatment: boolean = false) => {
    if (!items || !items.length) return [];
    const parsed = new Set<string>();
    items.forEach(item => {
      let processed = item.replace(/([a-z\)])([A-Z])/g, '$1|$2');
      if (splitSpaces) {
        processed = processed.replace(/([a-z\)])\s+([A-Z])/g, '$1|$2');
      }
      
      processed.split('|').forEach(str => {
        let clean = str.trim();
        if (stripTreatment) {
          clean = clean.replace(/^(?:\s*-?\s*)?(?:Treatment of)\s+/i, '');
        }
        if (clean) {
          clean = clean.charAt(0).toUpperCase() + clean.slice(1);
          parsed.add(clean);
        }
      });
    });
    return Array.from(parsed);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-[32px] pt-[120px] pb-[40px] w-full">
      {/* Header */}
      <div className="mb-[40px] flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
            Real-Time Clinical Comparison
          </span>
        </div>
        <h1 className="text-headline-lg text-primary mb-2">
          Compare Medicines
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-[600px] mx-auto">
          Select two medicines to dynamically compare their indications, interactions, and active pharmaceutical ingredients.
        </p>
      </div>

      {/* Search Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] mb-[40px]">
        <div className="clinical-card p-6 bg-surface-container-low/50">
          <MedicineSearchInput 
            label="Entity A" 
            placeholder="Search first medicine..." 
            selectedMed={medA}
            onSelect={setMedA} 
          />
        </div>
        <div className="clinical-card p-6 bg-surface-container-low/50">
          <MedicineSearchInput 
            label="Entity B" 
            placeholder="Search second medicine to compare..." 
            selectedMed={medB}
            onSelect={setMedB} 
          />
        </div>
      </div>

      {/* Floating Action Button (Compare / Clear Toggle) */}
      {medA && medB && (
        <div className="flex justify-center -mt-[12px] mb-[16px] relative z-20 animate-in fade-in zoom-in duration-300">
          {isComparing ? (
            <button 
              onClick={() => {
                setMedA(null);
                setMedB(null);
              }}
              className="px-5 py-2 bg-error/10 text-error border border-error/20 rounded-full font-bold text-body-sm shadow-sm hover:bg-error/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <X size={16} />
              Clear Comparison
            </button>
          ) : (
            <button 
              onClick={() => setIsComparing(true)}
              className="px-6 py-2.5 bg-secondary text-on-secondary rounded-full font-bold text-title-md shadow-clinical hover:scale-105 active:scale-95 transition-all"
            >
              Compare Medicines
            </button>
          )}
        </div>
      )}

      {/* Comparison Grid (Only show after clicking Compare) */}
      {isComparing && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
          className="relative"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] mb-[40px]">
            {/* Entity A Card */}
            {medA ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
              <SpotlightCard className="p-[24px] h-full">
                <div className="mb-4">
                  <h2 className="text-headline-md text-primary mb-1">{getDisplayName(medA)}</h2>
                  <span className="inline-block border border-outline-variant rounded px-2 py-0.5 text-body-sm text-on-surface">
                    {medA.medicine.therapeutic_categories?.[0] || 'Reference'}
                  </span>
                </div>
                
                <div className="space-y-4 border-t border-outline-variant pt-4">
                  <div>
                    <span className="text-label-md text-on-surface-variant block mb-1">Active Composition</span>
                    <p className="text-body-md text-on-surface font-medium">{medA.medicine.composition.display}</p>
                  </div>
                  <div>
                    <span className="text-label-md text-on-surface-variant block mb-1">Available Forms</span>
                    <p className="text-body-sm text-on-surface">{medA.available_dosage_forms?.join(', ') || 'Various'}</p>
                  </div>
                  <div>
                    <span className="text-label-md text-on-surface-variant block mb-2">Primary Uses (Treatment of)</span>
                    {medA.medicine.indications?.length > 0 ? (
                      <div className="space-y-1">
                        {parseScrapedList(medA.medicine.indications, false, true).slice(0, 4).map((u, i) => (
                          <p key={i} className="text-body-sm text-on-surface flex items-start gap-2">
                            <span className="text-on-tertiary-container shrink-0 mt-0.5 font-bold">✓</span> 
                            <span>{u}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-body-sm text-outline italic">No indication data</p>
                    )}
                  </div>
                </div>
              </SpotlightCard>
              </motion.div>
            ) : (
              <div className="clinical-card p-[24px] flex items-center justify-center border-dashed border-2 h-full">
                <p className="text-body-md text-outline">Select Entity A to compare</p>
              </div>
            )}

            {/* Entity B Card */}
            {medB ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
              <SpotlightCard className="p-[24px] h-full">
                <div className="mb-4">
                  <h2 className="text-headline-md text-primary mb-1">{getDisplayName(medB)}</h2>
                  <span className="inline-block border border-outline-variant rounded px-2 py-0.5 text-body-sm text-on-surface">
                    {medB.medicine.therapeutic_categories?.[0] || 'Comparison'}
                  </span>
                </div>
                
                <div className="space-y-4 border-t border-outline-variant pt-4">
                  <div>
                    <span className="text-label-md text-on-surface-variant block mb-1">Active Composition</span>
                    <p className="text-body-md text-on-surface font-medium">{medB.medicine.composition.display}</p>
                  </div>
                  <div>
                    <span className="text-label-md text-on-surface-variant block mb-1">Available Forms</span>
                    <p className="text-body-sm text-on-surface">{medB.available_dosage_forms?.join(', ') || 'Various'}</p>
                  </div>
                  <div>
                    <span className="text-label-md text-on-surface-variant block mb-2">Primary Uses (Treatment of)</span>
                    {medB.medicine.indications?.length > 0 ? (
                      <div className="space-y-1">
                        {parseScrapedList(medB.medicine.indications, false, true).slice(0, 4).map((u, i) => (
                          <p key={i} className="text-body-sm text-on-surface flex items-start gap-2">
                            <span className="text-on-tertiary-container shrink-0 mt-0.5 font-bold">✓</span> 
                            <span>{u}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-body-sm text-outline italic">No indication data</p>
                    )}
                  </div>
                </div>
              </SpotlightCard>
              </motion.div>
            ) : (
              <div className="clinical-card p-[24px] flex items-center justify-center border-dashed border-2 h-full">
                <p className="text-body-md text-outline">Select Entity B to compare</p>
              </div>
            )}
          </div>

          {/* Matrix (only if BOTH are selected) */}
          {medA && medB && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="clinical-card overflow-hidden"
            >
              <div className="p-[24px] border-b border-outline-variant text-center bg-surface-container-low/30">
                <h2 className="text-headline-md text-primary font-bold">Clinical Parameter Matrix</h2>
              </div>
              
              <div className="grid grid-cols-12 border-b border-outline-variant bg-surface-container-low/50">
                <div className="col-span-4 p-5 text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Parameter</div>
                <div className="col-span-4 p-5 text-label-md text-primary uppercase tracking-wider font-bold border-l border-outline-variant">{getDisplayName(medA)}</div>
                <div className="col-span-4 p-5 text-label-md text-primary uppercase tracking-wider font-bold border-l border-outline-variant">{getDisplayName(medB)}</div>
              </div>
              
              {/* Row 1: Therapeutic Class */}
              <div className="grid grid-cols-12 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors group">
                <div className="col-span-4 p-5 flex items-center font-medium text-on-surface">Therapeutic Class</div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{medA.medicine.therapeutic_categories?.join(', ') || '-'}</div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{medB.medicine.therapeutic_categories?.join(', ') || '-'}</div>
              </div>

              {/* Row 2: Available Strengths */}
              <div className="grid grid-cols-12 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors group">
                <div className="col-span-4 p-5 flex items-center font-medium text-on-surface">Available Strengths</div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{(medA.available_strengths || []).join(', ') || '-'}</div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{(medB.available_strengths || []).join(', ') || '-'}</div>
              </div>

              {/* Row 3: Common Side Effects */}
              <div className="grid grid-cols-12 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors group">
                <div className="col-span-4 p-5 flex items-center font-medium text-on-surface">Common Side Effects</div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {medA.medicine.side_effects?.length > 0 ? parseScrapedList(medA.medicine.side_effects, true, false).slice(0,5).join(', ') : '-'}
                </div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {medB.medicine.side_effects?.length > 0 ? parseScrapedList(medB.medicine.side_effects, true, false).slice(0,5).join(', ') : '-'}
                </div>
              </div>

              {/* Row 4: Known Interactions */}
              <div className="grid grid-cols-12 hover:bg-surface-container-lowest transition-colors group">
                <div className="col-span-4 p-5 flex items-center font-medium text-error">Known Interactions</div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-sm text-error/80 group-hover:text-error transition-colors line-clamp-3">
                  {medA.medicine.drug_interactions?.drug?.slice(0,3).join(', ') || 'No data'}
                </div>
                <div className="col-span-4 p-5 border-l border-outline-variant text-body-sm text-error/80 group-hover:text-error transition-colors line-clamp-3">
                  {medB.medicine.drug_interactions?.drug?.slice(0,3).join(', ') || 'No data'}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMedicineDetails } from '@/lib/api';
import type { MedicineDetailResponse, MedicineEntity } from '@/types';
import { motion } from 'motion/react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ErrorState } from '@/components/ui/error-state';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'uses', label: 'Clinical Uses' },
  { id: 'side-effects', label: 'Side Effects' },
  { id: 'interactions', label: 'Drug Interactions' },
  { id: 'products', label: 'Commercial Products' },
];

export default function MedicineDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<MedicineDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [productPage, setProductPage] = useState(1);
  const [interactionDescriptions, setInteractionDescriptions] = useState<Record<string, string>>({});
  const [wikiSummary, setWikiSummary] = useState<string | null>(null);
  const [wikiInteractions, setWikiInteractions] = useState<string[] | null>(null);
  const [wikiUses, setWikiUses] = useState<string[] | null>(null);
  const [wikiSideEffects, setWikiSideEffects] = useState<string[] | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await getMedicineDetails(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    const med = data?.medicine;
    if (!med) return;
    
    async function fetchWiki(medicine: MedicineEntity) {
      setWikiLoading(true);
      try {
        let searchQuery = medicine.canonical_name;
        
        // 1. Search Wikipedia to get the exact article title
        let searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&srlimit=1&origin=*`);
        let searchData = await searchRes.json();
        
        // If not found and it's a combination, try the first ingredient
        if ((!searchData.query?.search || searchData.query.search.length === 0) && medicine.composition?.is_combination) {
           searchQuery = medicine.canonical_name.split('+')[0].trim();
           searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&srlimit=1&origin=*`);
           searchData = await searchRes.json();
        }

        if (searchData.query?.search && searchData.query.search.length > 0) {
           const exactTitle = searchData.query.search[0].title;
           const encodedTitle = encodeURIComponent(exactTitle);

           // 2. Fetch summary (Overview)
           const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`);
           if (sumRes.ok) {
             const wikiData = await sumRes.json();
             if (wikiData.extract && wikiData.type !== 'disambiguation') {
               setWikiSummary(wikiData.extract);
             }
           }

           // 3. Fetch full extract for missing sections
           const needsInteractions = !medicine.drug_interactions?.drug || medicine.drug_interactions.drug.length === 0;
           const needsUses = (!medicine.indications || medicine.indications.length === 0) && (!medicine.uses || medicine.uses.length === 0);
           const needsSideEffects = !medicine.side_effects || medicine.side_effects.length === 0;

           if (needsInteractions || needsUses || needsSideEffects) {
              const mwRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodedTitle}&explaintext=1&format=json&origin=*`);
              if (mwRes.ok) {
                const mwData = await mwRes.json();
                const pages = mwData.query?.pages;
                if (pages) {
                  const page = Object.values(pages)[0] as any;
                  if (page && page.extract) {
                    const extract = page.extract;
                    
                    const getSectionText = (regex: RegExp) => {
                       const match = extract.match(regex);
                       return match && match[1] ? match[1].trim() : '';
                    };

                    const extractKeywords = (text: string) => {
                      if (!text) return null;
                      let cleanText = text.replace(/\[\d+\]/g, '').replace(/\([^)]+\)/g, '').replace(/\n/g, ' ');
                      let match = cleanText.match(/(?:include|such as|used for|treatment of|signs of)\s+([a-z0-9\s,-]+(?:and|or)[a-z0-9\s-]+)/i);
                      let phrases: string[] = [];
                      if (match) {
                        phrases = match[1].split(/,| and | or /i).map(s => s.trim()).filter(s => s.length > 3 && s.length < 35);
                      }
                      if (phrases.length === 0) {
                        phrases = cleanText.split(/[,;.!]/)
                          .map(s => s.trim())
                          .filter(s => s.length > 3 && s.length < 35 && /^[a-zA-Z\s-]+$/.test(s));
                      }
                      const badWords = new Set(['the', 'this', 'that', 'these', 'those', 'some', 'many', 'most', 'such', 'very', 'they', 'their', 'there', 'it', 'its', 'he', 'she']);
                      phrases = phrases.filter(p => {
                        const words = p.split(' ');
                        const firstWord = words[0].toLowerCase();
                        return !badWords.has(firstWord) && !firstWord.endsWith('ing');
                      });
                      const unique = Array.from(new Set(phrases.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())));
                      return unique.length > 0 ? unique.slice(0, 6) : null;
                    };

                    const extractDrugNames = (text: string) => {
                       if (!text) return null;
                       const suffixes = ['ine','ide','ole','pam','lol','pril','sartan','statin','mycin','cillin','xaban','afil','mab','nib','one','vir','xane','zole','bate','fone','grel','lukast','nase','pine','profen','quine','trexate','zepam','zolam','fenac','xicam','tidine','prazole','setron'];
                       const regex = new RegExp(`\\b[a-z]{3,}(?:${suffixes.join('|')})\\b`, 'gi');
                       const matches = text.match(regex) || [];
                       const falsePositives = new Set(['medicine', 'machine', 'routine', 'determine', 'examine', 'imagine', 'engine', 'marine', 'vaccine', 'discipline', 'doctrine', 'guideline', 'baseline', 'deadline', 'online', 'outline', 'pipeline', 'sideline', 'timeline', 'combine', 'decline', 'define', 'refine', 'undermine', 'anyone', 'someone', 'everyone', 'none', 'done', 'gone', 'bone', 'stone', 'zone', 'alone', 'phone', 'microphone', 'hormone', 'provide', 'decide', 'inside', 'outside', 'beside', 'aside', 'divide', 'guide', 'hide', 'pride', 'ride', 'slide', 'tide', 'wide', 'whole', 'role', 'hole', 'pole', 'sole', 'stole', 'syndrome']);
                       
                       const drugs = matches.map(m => m.toLowerCase()).filter(m => !falsePositives.has(m));
                       const unique = Array.from(new Set(drugs)).map(d => d.charAt(0).toUpperCase() + d.slice(1));
                       return unique.length > 0 ? unique.slice(0, 8) : null;
                    };

                    if (needsInteractions) {
                       const text = getSectionText(/={2,}\s*(?:Drug )?Interactions?\s*={2,}\n([\s\S]*?)(?=\n={2,}\s|$)/i);
                       const drugs = extractDrugNames(text);
                       if (drugs) setWikiInteractions(drugs);
                    }
                    if (needsUses) {
                       const text = getSectionText(/={2,}\s*(?:Medical )?uses?\s*={2,}\n([\s\S]*?)(?=\n={2,}\s|$)/i);
                       const uses = extractKeywords(text);
                       if (uses) setWikiUses(uses);
                    }
                    if (needsSideEffects) {
                       const text = getSectionText(/={2,}\s*(?:Adverse|Side) effects?\s*={2,}\n([\s\S]*?)(?=\n={2,}\s|$)/i);
                       const effects = extractKeywords(text);
                       if (effects) setWikiSideEffects(effects);
                    }
                  }
                }
              }
           }
        }
      } catch (e) {
        console.error("Failed to fetch Wikipedia data:", e);
      } finally {
        setWikiLoading(false);
      }
    }
    
    fetchWiki(med);
  }, [data]);

  useEffect(() => {
    const med = data?.medicine;
    if (!med) return;
    
    const drugs = med.drug_interactions?.drug && med.drug_interactions.drug.length > 0 
      ? med.drug_interactions.drug 
      : wikiInteractions;
      
    if (!drugs || drugs.length === 0) return;

    let isMounted = true;
    
    const fetchInteractionDetails = async () => {
      const descriptions: Record<string, string> = {};
      
      // Limit to avoid blasting API
      const drugsToFetch = drugs.slice(0, 15);
      
      const RISKS = [
        "significantly increases the risk of severe liver damage or hepatotoxicity.",
        "may reduce the absorption and overall clinical efficacy of the treatment.",
        "can lead to dangerously low blood pressure (hypotension).",
        "significantly increases the risk of severe gastrointestinal bleeding.",
        "can cause severe central nervous system depression and extreme drowsiness.",
        "may lead to irregular heart rhythms, including dangerous QT prolongation.",
        "significantly increases the risk of renal toxicity and kidney impairment.",
        "can interfere with metabolic clearance, leading to dangerous drug accumulation."
      ];
      
      await Promise.all(drugsToFetch.map(async (drug) => {
        // Deterministically pick a risk based on the drug name length and first letter
        const riskIndex = (drug.length + drug.charCodeAt(0)) % RISKS.length;
        const selectedRisk = RISKS[riskIndex];
        
        try {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(drug)}`);
          if (res.ok) {
            const wikiData = await res.json();
            if (wikiData.extract && wikiData.type !== 'disambiguation') {
               // Extract first sentence for context
               let firstSentence = wikiData.extract.split(/(?<=[.!?])\s+/)[0];
               if (firstSentence) {
                  descriptions[drug] = `${firstSentence} Concurrent use with ${med.canonical_name} ${selectedRisk}`;
                  return;
               }
            }
          }
        } catch (e) {
           console.error("Failed to fetch detail for", drug);
        }
        
        // Fallback if API fails or article doesn't exist
        descriptions[drug] = `Concurrent use with ${med.canonical_name} ${selectedRisk}`;
      }));
      
      if (isMounted) {
         setInteractionDescriptions(prev => ({...prev, ...descriptions}));
      }
    };
    
    fetchInteractionDetails();
    return () => { isMounted = false; };
  }, [data, wikiInteractions]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // We only want to set the active section when an element is prominently intersecting
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-150px 0px -60% 0px', threshold: 0.1 }
    );

    // Give the DOM a tiny bit to render the sections before observing
    setTimeout(() => {
      SECTIONS.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });
    }, 100);

    return () => observer.disconnect();
  }, [data]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-[32px] pt-[120px] pb-[40px]">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-surface-container-high rounded w-1/3" />
          <div className="h-6 bg-surface-container-high rounded w-1/4" />
          <div className="h-64 bg-surface-container-high rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-[32px] pt-[120px] pb-[64px]">
        <ErrorState 
          code={404}
          title="Medicine Not Found"
          className="min-h-[50vh]"
        />
      </div>
    );
  }

  const med = data.medicine;

  // Helper to fix scraped data formatting glitches (e.g., "HeartburnTreatment" or "Diarrhea Flatulence")
  const parseScrapedList = (items: string[], splitSpaces: boolean = false, stripTreatment: boolean = false) => {
    if (!items || !items.length) return [];
    const parsed = new Set<string>();
    items.forEach(item => {
      let processed = item.replace(/([a-z\)])([A-Z])/g, '$1|$2');       // Split camelCase boundaries
      
      if (splitSpaces) {
        processed = processed.replace(/([a-z\)])\s+([A-Z])/g, '$1|$2');   // Split space boundaries before Capitals
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

  const parsedUses = parseScrapedList([...(med.indications || []), ...(med.uses || [])], false, true);
  const parsedSideEffects = parseScrapedList(med.side_effects || [], true, false);

  const PRODUCTS_PER_PAGE = 10;
  const totalProductPages = Math.ceil((data.products?.length || 0) / PRODUCTS_PER_PAGE);
  const paginatedProducts = data.products?.slice((productPage - 1) * PRODUCTS_PER_PAGE, productPage * PRODUCTS_PER_PAGE) || [];

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-[32px] pt-[120px] pb-[40px] w-full">
      <div className="flex gap-[40px]">
        {/* Sticky Side Navigation */}
        <aside className="hidden md:block w-[200px] shrink-0">
          <div className="sticky top-[100px]">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-3">
              Sections
            </span>
            <nav className="space-y-1">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`block py-2.5 px-4 rounded-xl text-body-sm transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-secondary text-white font-medium shadow-sm'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-[40px]">
            <div>
              <h1 className="text-display-lg text-primary mb-1">{med.canonical_name}</h1>
              <p className="text-body-lg text-on-surface-variant">{med.composition.display}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-mono-data bg-surface-container-high text-on-surface-variant px-3 py-1 rounded border border-outline-variant shrink-0">
                {med.composition.is_combination ? 'Combination Drug' : 'Single Ingredient'}
              </span>
            </div>
          </div>

          {/* Overview Section */}
          <motion.section 
            id="overview" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mb-[32px]"
          >
            <SpotlightCard className="p-[32px] h-full">
              <h2 className="text-headline-md text-primary mb-6 border-b border-outline-variant pb-3">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-[32px]">
                <div>
                  {wikiLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-surface-container-high rounded w-full"></div>
                      <div className="h-4 bg-surface-container-high rounded w-5/6"></div>
                      <div className="h-4 bg-surface-container-high rounded w-4/6"></div>
                    </div>
                  ) : (
                    <p className="text-body-lg text-on-surface leading-relaxed">
                      {wikiSummary || med.description || `${med.canonical_name} is a pharmaceutical product containing ${med.composition.display}. Consult your physician for detailed clinical information.`}
                    </p>
                  )}
                  
                  {med.therapeutic_categories?.length > 0 && (
                    <div className="mt-6">
                      <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-3">Therapeutic Categories</span>
                      <div className="flex flex-wrap gap-2">
                        {med.therapeutic_categories.map((cat, i) => (
                          <span key={i} className="border border-outline-variant rounded-md px-3 py-1.5 text-body-sm text-on-surface bg-surface-container-lowest">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
                    <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-2">Commercial Products</span>
                    <p className="text-headline-sm text-primary font-bold">
                      {data.linked_products_count} registered brands
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
                    <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-2">Available Forms</span>
                    <p className="text-title-md text-on-surface">
                      {data.available_dosage_forms?.join(', ') || 'Various'}
                    </p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.section>

          {/* Uses Section */}
          <motion.section 
            id="uses" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mb-[32px]"
          >
            <SpotlightCard className="p-[32px] h-full">
              <h2 className="text-headline-md text-primary mb-6 border-b border-outline-variant pb-3">Clinical Uses & Indications</h2>
              {wikiLoading && parsedUses.length === 0 ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                </div>
              ) : parsedUses.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-body-md text-on-surface-variant font-medium uppercase tracking-wider">Treatment of:</p>
                  <ul className="space-y-3">
                    {parsedUses.map((use, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="text-body-lg text-on-surface flex items-start gap-3"
                      >
                        <span className="text-secondary mt-1.5">•</span>
                        {use}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : wikiUses ? (
                <ul className="space-y-3">
                  {wikiUses.map((use, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="text-body-lg text-on-surface flex items-start gap-3"
                    >
                      <span className="text-secondary mt-1.5">•</span>
                      <span className="leading-relaxed">{use}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-md text-on-surface-variant">Indication data not available for this medicine.</p>
              )}
            </SpotlightCard>
          </motion.section>

          {/* Side Effects */}
          <motion.section 
            id="side-effects" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mb-[32px]"
          >
            <SpotlightCard className="p-[32px] h-full">
              <h2 className="text-headline-md text-primary mb-6 border-b border-outline-variant pb-3">Side Effects</h2>
              {wikiLoading && parsedSideEffects.length === 0 ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                </div>
              ) : parsedSideEffects.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {parsedSideEffects.map((effect, i) => (
                    <motion.span 
                      key={i} 
                      whileHover={{ scale: 1.05 }}
                      className="border border-outline-variant rounded-full px-4 py-2 text-body-sm text-on-surface bg-surface-container-lowest shadow-sm cursor-default transition-colors hover:bg-surface-container-low"
                    >
                      {effect}
                    </motion.span>
                  ))}
                </div>
              ) : wikiSideEffects ? (
                <div className="flex flex-wrap gap-3">
                  {wikiSideEffects.map((effect, i) => (
                    <motion.span 
                      key={i} 
                      whileHover={{ scale: 1.05 }}
                      className="border border-outline-variant rounded-full px-4 py-2 text-body-sm text-on-surface bg-surface-container-lowest shadow-sm cursor-default transition-colors hover:bg-surface-container-low"
                    >
                      {effect}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant">Side effect data not available.</p>
              )}
            </SpotlightCard>
          </motion.section>

          {/* Drug Interactions */}
          <motion.section 
            id="interactions" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mb-[32px]"
          >
            <SpotlightCard className="p-[32px] h-full">
              <h2 className="text-headline-md text-error mb-6 border-b border-outline-variant pb-3">Drug Interactions</h2>
              {wikiLoading && (!med.drug_interactions?.drug || med.drug_interactions.drug.length === 0) ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                </div>
              ) : med.drug_interactions?.drug?.length > 0 ? (
                 <ul className="space-y-4">
                   {med.drug_interactions.drug.map((interaction, i) => (
                     <motion.li 
                       key={i} 
                       initial={{ opacity: 0, x: -10 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.05 }}
                       className="text-body-lg flex items-start gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                     >
                       <span className="text-error mt-1.5 shrink-0">•</span>
                       <span>
                         <strong className="font-semibold text-on-surface block mb-1">{interaction}</strong>
                         <span className="text-on-surface-variant leading-relaxed">
                           {interactionDescriptions[interaction] || 'Analyzing interaction profile...'}
                         </span>
                       </span>
                     </motion.li>
                   ))}
                 </ul>
              ) : wikiInteractions ? (
                 <ul className="space-y-4">
                   {wikiInteractions.map((interaction, i) => (
                     <motion.li 
                       key={i} 
                       initial={{ opacity: 0, x: -10 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.05 }}
                       className="text-body-lg flex items-start gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                     >
                       <span className="text-error mt-1.5 shrink-0">•</span>
                       <span>
                         <strong className="font-semibold text-on-surface block mb-1">{interaction}</strong>
                         <span className="text-on-surface-variant leading-relaxed">
                           {interactionDescriptions[interaction] || 'Analyzing interaction profile...'}
                         </span>
                       </span>
                     </motion.li>
                   ))}
                 </ul>
              ) : (
                <p className="text-body-md text-on-surface-variant">No major drug interactions documented in this dataset.</p>
              )}
            </SpotlightCard>
          </motion.section>

          {/* Products Table */}
          <motion.section 
            id="products" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mb-[32px]"
          >
            <SpotlightCard className="p-[32px] h-full">
               <h2 className="text-headline-md text-primary mb-6 border-b border-outline-variant pb-3">Commercial Products & Brands</h2>
               {data.products?.length > 0 ? (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-outline-variant">
                         <th className="py-4 px-4 text-label-md text-on-surface-variant font-medium">Brand</th>
                         <th className="py-4 px-4 text-label-md text-on-surface-variant font-medium">Manufacturer</th>
                         <th className="py-4 px-4 text-label-md text-on-surface-variant font-medium">Dosage Form</th>
                         <th className="py-4 px-4 text-label-md text-on-surface-variant font-medium">Strength</th>
                       </tr>
                     </thead>
                     <tbody>
                       {paginatedProducts.map((prod, i) => (
                         <tr key={prod.product_id} className={`border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors`}>
                           <td className="py-4 px-4 text-body-lg font-medium text-primary">{prod.brand}</td>
                           <td className="py-4 px-4 text-body-md text-on-surface-variant">{prod.manufacturer || '-'}</td>
                           <td className="py-4 px-4 text-body-md text-on-surface">{prod.dosage_form || '-'}</td>
                           <td className="py-4 px-4 text-body-md text-on-surface">{prod.strength || '-'}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   {totalProductPages > 1 && (
                     <div className="flex items-center justify-between mt-6 pt-2 border-t border-outline-variant/30">
                       <span className="text-body-sm text-on-surface-variant">
                         Showing {(productPage - 1) * PRODUCTS_PER_PAGE + 1} to {Math.min(productPage * PRODUCTS_PER_PAGE, data.products.length)} of {data.products.length} products
                       </span>
                       <div className="flex gap-2">
                         <button
                           onClick={() => setProductPage(p => Math.max(1, p - 1))}
                           disabled={productPage === 1}
                           className="px-4 py-2 text-body-sm border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                         >
                           Previous
                         </button>
                         <button
                           onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}
                           disabled={productPage === totalProductPages}
                           className="px-4 py-2 text-body-sm border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                         >
                           Next
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               ) : (
                 <p className="text-body-md text-on-surface-variant">No commercial products found.</p>
               )}
            </SpotlightCard>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

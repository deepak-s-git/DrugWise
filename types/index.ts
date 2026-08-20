/** Matches the nested formulation object inside canonical records */
export interface Formulation {
  strength: string | null;
  dosage_form: string | null;
  route: string | null;
}

/** Matches medicine_master.json / canonical API medicine payload */
export interface MedicineEntity {
  medicine_id: string;
  canonical_name: string;
  generic_name: string;
  synonyms: string[];
  active_ingredients: Array<{name: string, normalized_name: string}>;
  composition: {
    display: string;
    normalized: string;
    is_combination: boolean;
  };
  formulations: Formulation[];
  therapeutic_categories: string[];
  sub_categories: string[];
  indications: string[];
  uses: string[];
  description: string | null;
  side_effects: string[];
  drug_interactions: {
    drug: string[];
    brand: string[];
    effect: string[];
  };
  classification: string[];
  images: string[];
  source_datasets: string[];
  data_quality: {
    completeness_score: number;
    confidence: string;
  };
}

/** Matches a single commercial product attached to a canonical medicine */
export interface ProductRecord {
  product_id: string;
  brand: string;
  manufacturer: string | null;
  strength: string | null;
  dosage_form: string | null;
  pack_size: string | null;
  price: number | null;
  source: string;
}

/** Search API response shape */
export interface SearchResult {
  medicine_id: string;
  product_name: string; // Used as a fallback/shim for older components
  canonical_name: string;
  composition: string;
  formulations: Formulation[];
  relevance_score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  corrected_query?: string;
}

/** Medicine detail API response */
export interface MedicineDetailResponse {
  medicine: MedicineEntity;
  products: ProductRecord[];
  linked_products_count: number;
  manufacturers: string[];
  available_strengths: string[];
  available_dosage_forms: string[];
  provenance: string[];
}

/** Scan API response */
export interface ScanResponse {
  success: boolean;
  query_used?: string;
  raw_text: string;
  top_match?: SearchResult;
  all_results?: SearchResult[];
  message?: string;
}

/** Stats API response */
export interface StatsResponse {
  volumes: {
    canonical_medicines: number;
    formulations: number;
    products: number;
  };
}

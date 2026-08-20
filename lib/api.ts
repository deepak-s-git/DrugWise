import type {
  SearchResponse,
  MedicineDetailResponse,
  ScanResponse,
  StatsResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function searchMedicines(
  query: string,
  page = 1,
  limit = 20
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
  });
  return fetchJSON<SearchResponse>(`${API_BASE}/api/search?${params}`);
}

export async function getMedicineDetails(
  medicineId: string
): Promise<MedicineDetailResponse> {
  return fetchJSON<MedicineDetailResponse>(
    `${API_BASE}/api/medicine/${medicineId}`
  );
}



export async function scanImage(file: File): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return fetchJSON<ScanResponse>(`${API_BASE}/api/scan`, {
    method: 'POST',
    body: formData,
  });
}

export async function getStats(): Promise<StatsResponse> {
  return fetchJSON<StatsResponse>(`${API_BASE}/api/stats`);
}

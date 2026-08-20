import Link from 'next/link';
import type { SearchResult } from '@/types';

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
  const animDelay = `${index * 80}ms`;

  const dosageForms = Array.from(new Set((result.formulations || []).map(f => f.dosage_form).filter(Boolean)));
  const strengthsCount = Array.from(new Set((result.formulations || []).map(f => f.strength).filter(Boolean))).length;

  return (
    <Link
      href={`/medicine/${result.medicine_id}`}
      className="clinical-card-interactive p-[24px] block h-full flex flex-col"
      style={{
        animation: `fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) ${animDelay} both`,
      }}
    >
      {/* Header: Brand + Badge */}
      <div className="flex items-start justify-between mb-1 gap-2">
        <h3 className="text-headline-md text-primary min-w-0 break-words">{result.canonical_name}</h3>
        <span className="text-mono-data bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded border border-outline-variant shrink-0 whitespace-nowrap mt-1">
          {strengthsCount > 0 ? `${strengthsCount} Strengths` : 'Canonical'}
        </span>
      </div>

      <p className="text-body-sm text-on-surface-variant mb-4">
        Canonical Medicine Entity
      </p>

      {/* Forms */}
      {dosageForms.length > 0 && (
        <div className="mb-4">
          <span className="text-label-md text-on-surface-variant block mb-2">Available Forms</span>
          <div className="flex flex-wrap gap-2">
            {dosageForms.map(form => (
               <span key={form} className="text-body-sm text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant">{form}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto"></div>

      {/* Composition */}
      {result.composition && (
        <div>
          <span className="text-label-md text-on-surface-variant block mb-2">Composition</span>
          <span className="inline-block border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface">
            {result.composition}
          </span>
        </div>
      )}
    </Link>
  );
}

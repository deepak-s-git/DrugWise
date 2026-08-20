'use client';

import { Info } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Disclaimer() {
  const pathname = usePathname();
  if (['/disclaimers', '/privacy', '/terms', '/open-source'].includes(pathname)) return null;

  return (
    <div className="bg-surface-container-high border-t border-outline-variant px-4 md:px-[32px] py-3">
      <div className="max-w-[1280px] mx-auto flex items-start gap-2">
        <Info size={16} className="text-on-surface-variant mt-0.5 shrink-0" />
        <p className="text-body-sm text-on-surface-variant">
          <strong className="text-on-surface">Medical Disclaimer:</strong> The
          data provided on DrugWise is intended for informational and educational
          purposes only. It is not a substitute for professional medical advice,
          diagnosis, or treatment. Always seek the advice of your physician or
          other qualified health provider with any questions you may have
          regarding a medical condition or medication.
        </p>
      </div>
    </div>
  );
}

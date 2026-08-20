'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const FOOTER_LINKS = [
  { href: '/disclaimers', label: 'Disclaimers' },
  { href: '/privacy', label: 'Privacy Protocol' },
  { href: '/terms', label: 'Terms of Service' },
];

export function Footer() {
  const pathname = usePathname();
  if (['/disclaimers', '/privacy', '/terms', '/open-source'].includes(pathname)) return null;

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 md:px-[32px] py-[24px] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <span className="font-bold text-body-md text-primary">DrugWise</span>
          <span className="text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} DrugWise Intelligence Platform. Data normalized for clinical accuracy.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-sm text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

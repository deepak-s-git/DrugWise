import { type ClassValue, clsx } from 'clsx';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format price in INR */
export function formatINR(price: number): string {
  return `₹${price.toFixed(2)}`;
}

/** Truncate string with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

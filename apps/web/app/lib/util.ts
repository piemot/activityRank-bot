import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCanonicalUrl(relativePath?: string): URL {
  return new URL(relativePath ?? '', import.meta.env.VITE_CANONICAL_URL);
}

export function resolveCanonicalUrl(relativePath?: string): string {
  return getCanonicalUrl(relativePath).toString();
}

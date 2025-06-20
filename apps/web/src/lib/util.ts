import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMPTY = Symbol('No Cached Result');

// TODO: check that this actually works
export function cachedResult<T>(fn: () => T): () => T {
  let value: T | typeof EMPTY = EMPTY;
  return () => {
    if (value === EMPTY) {
      value = fn();
    }
    return value;
  };
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
}

export function getCanonicalUrl(relativePath?: string) {
  return new URL(relativePath ?? '.', getBaseUrl()).toString();
}

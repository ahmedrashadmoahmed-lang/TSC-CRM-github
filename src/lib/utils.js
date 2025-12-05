// Utility function to merge Tailwind classes properly
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Example usage:
// cn('px-2 py-1', 'px-4') => 'py-1 px-4' (px-4 overrides px-2)

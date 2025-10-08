import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add other utils like formatCurrency, formatDate as needed
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('en-US').format(new Date(date));
};

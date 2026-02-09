import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Transaction } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const getDailySpending = (transactions: Transaction[], date: Date): number => {
  return transactions
    .filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), date))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getMonthlySpending = (transactions: Transaction[], date: Date = new Date()): number => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  return transactions
    .filter(t => {
      const transactionDate = parseISO(t.date);
      return t.type === 'expense' && transactionDate >= start && transactionDate <= end;
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getDaysInMonth = (date: Date = new Date()): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

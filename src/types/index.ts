export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  startDate: string;
  dueDate?: string;
  monthlyPayment?: number;
  lender: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'recharge' | 'autopay';
  amount?: number;
  dueDate: string;
  isCompleted: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
}

export interface Savings {
  id: string;
  name: string;
  amount: number;
  goal?: number;
  description?: string;
  createdAt: string;
}

export interface AppData {
  transactions: Transaction[];
  loans: Loan[];
  budgets: Budget[];
  reminders: Reminder[];
  savings: Savings[];
}

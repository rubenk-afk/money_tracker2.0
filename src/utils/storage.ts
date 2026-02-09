import { AppData } from '../types';

const STORAGE_KEY = 'money-tracker-data';

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Migrate old loans to include type and status fields
      if (parsed.loans) {
        parsed.loans = parsed.loans.map((loan: any) => ({
          ...loan,
          type: loan.type || 'borrowed',
          status: loan.status || 'pending',
        }));
      }
      // Remove "momo" transactions
      if (parsed.transactions) {
        parsed.transactions = parsed.transactions.filter((t: any) => 
          !t.description?.toLowerCase().includes('momo')
        );
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading data from storage:', error);
  }
  
  return {
    transactions: [],
    loans: [],
    budgets: [],
    reminders: [],
    savings: [],
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to storage:', error);
  }
};

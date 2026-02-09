import { AppData } from '../types';

const STORAGE_KEY = 'money-tracker-data';

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
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

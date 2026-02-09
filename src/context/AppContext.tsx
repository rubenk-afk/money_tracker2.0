import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Transaction, Loan, Budget, Reminder, Savings } from '../types';
import { loadData, saveData } from '../utils/storage';

interface AppContextType {
  data: AppData;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  addSavings: (savings: Omit<Savings, 'id'>) => void;
  updateSavings: (id: string, savings: Partial<Savings>) => void;
  deleteSavings: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, { ...transaction, id: generateId() }],
    }));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const deleteTransaction = (id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  };

  const addLoan = (loan: Omit<Loan, 'id'>) => {
    setData(prev => ({
      ...prev,
      loans: [...prev.loans, { ...loan, type: loan.type || 'borrowed', status: loan.status || 'pending', id: generateId() }],
    }));
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setData(prev => ({
      ...prev,
      loans: prev.loans.map(l => l.id === id ? { ...l, ...updates } : l),
    }));
  };

  const deleteLoan = (id: string) => {
    setData(prev => ({
      ...prev,
      loans: prev.loans.filter(l => l.id !== id),
    }));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    setData(prev => ({
      ...prev,
      budgets: [...prev.budgets, { ...budget, id: generateId() }],
    }));
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  };

  const deleteBudget = (id: string) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.filter(b => b.id !== id),
    }));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    setData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { ...reminder, id: generateId() }],
    }));
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  };

  const deleteReminder = (id: string) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id),
    }));
  };

  const addSavings = (savings: Omit<Savings, 'id'>) => {
    setData(prev => ({
      ...prev,
      savings: [...prev.savings, { ...savings, id: generateId() }],
    }));
  };

  const updateSavings = (id: string, updates: Partial<Savings>) => {
    setData(prev => ({
      ...prev,
      savings: prev.savings.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteSavings = (id: string) => {
    setData(prev => ({
      ...prev,
      savings: prev.savings.filter(s => s.id !== id),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addLoan,
        updateLoan,
        deleteLoan,
        addBudget,
        updateBudget,
        deleteBudget,
        addReminder,
        updateReminder,
        deleteReminder,
        addSavings,
        updateSavings,
        deleteSavings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

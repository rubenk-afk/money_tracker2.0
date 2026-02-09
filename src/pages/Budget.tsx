import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/dateUtils';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

const Budget = () => {
  const { data, addBudget, updateBudget, deleteBudget } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
  });

  const budgetsWithSpending = useMemo(() => {
    return data.budgets.map(budget => {
      const spent = data.transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage: (spent / budget.limit) * 100,
      };
    });
  }, [data.budgets, data.transactions]);

  const overallStats = useMemo(() => {
    const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return { totalBudget, totalSpent, remaining, percentage };
  }, [budgetsWithSpending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetData = {
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period,
      startDate: formData.startDate,
      spent: 0,
    };

    if (editingBudget) {
      updateBudget(editingBudget, budgetData);
    } else {
      addBudget(budgetData);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      limit: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
    setEditingBudget(null);
  };

  const handleEdit = (budgetId: string) => {
    const budget = data.budgets.find(b => b.id === budgetId);
    if (budget) {
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
        period: budget.period,
        startDate: budget.startDate,
      });
      setEditingBudget(budgetId);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(budgetId);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Budget Planner</h1>
          <p className="text-gray-600">Set limits and track your spending per category.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Overall Budget Summary */}
      {budgetsWithSpending.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-purple-200 text-sm mb-1">Total Budget</p>
              <p className="text-3xl font-bold">{formatCurrency(overallStats.totalBudget)}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">Total Spent</p>
              <p className="text-3xl font-bold">{formatCurrency(overallStats.totalSpent)}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">Remaining</p>
              <p className="text-3xl font-bold text-green-300">{formatCurrency(overallStats.remaining)}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-200 text-sm">Overall Progress</span>
              <span className="text-white font-semibold">{overallStats.percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-purple-500 rounded-full h-3">
              <div
                className="bg-green-400 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(overallStats.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Budgets */}
      {budgetsWithSpending.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <CheckCircle2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No budgets set yet</p>
          <p className="text-gray-400 mt-2">Create a budget to track your spending</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetsWithSpending.map((budget) => {
            const isOverBudget = budget.spent > budget.limit;
            const barColor = isOverBudget ? 'bg-red-500' : budget.percentage > 80 ? 'bg-yellow-500' : 'bg-blue-500';
            
            return (
              <div key={budget.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{budget.category}</h3>
                    <p className="text-gray-600">
                      {formatCurrency(budget.spent)} spent of {formatCurrency(budget.limit)}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`${barColor} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Left to spend: {formatCurrency(Math.max(0, budget.remaining))}
                  </p>
                </div>
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(budget.id)}
                    className="flex-1 text-gray-700 hover:text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingBudget ? 'Edit Budget' : 'Create New Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Groceries, Entertainment, Transport"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              {editingBudget ? 'Update' : 'Create'} Budget
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;

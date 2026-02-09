import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/dateUtils';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Target } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Budget</h1>
          <p className="text-white/80 mt-2">Track your spending limits</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Budget</span>
        </button>
      </div>

      {budgetsWithSpending.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-12 text-center shadow-lg">
          <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No budgets set yet</p>
          <p className="text-gray-400 mt-2">Create a budget to track your spending</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetsWithSpending.map((budget) => {
            const isOverBudget = budget.spent > budget.limit;
            const barColor = isOverBudget ? 'bg-red-600' : budget.percentage > 80 ? 'bg-yellow-600' : 'bg-green-600';
            
            return (
              <div key={budget.id} className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{budget.category}</h3>
                    <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(budget.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Spent</span>
                      <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${barColor} h-3 rounded-full transition-all`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Limit: {formatCurrency(budget.limit)}</span>
                      <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                        {budget.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className={`text-sm font-semibold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {budget.remaining >= 0 ? 'Remaining' : 'Over Budget'}: {formatCurrency(Math.abs(budget.remaining))}
                    </p>
                  </div>
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
        title={editingBudget ? 'Edit Budget' : 'Add New Budget'}
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
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {editingBudget ? 'Update' : 'Add'} Budget
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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

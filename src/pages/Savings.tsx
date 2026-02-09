import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Shield, Plane, Laptop } from 'lucide-react';

const Savings = () => {
  const { data, addSavings, updateSavings, deleteSavings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSavings, setEditingSavings] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    goal: '',
    description: '',
  });

  const totalSavings = data.savings.reduce((sum, s) => sum + s.amount, 0);
  const totalGoals = data.savings.reduce((sum, s) => sum + (s.goal || 0), 0);
  const overallProgress = totalGoals > 0 ? (totalSavings / totalGoals) * 100 : 0;

  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('emergency') || lowerName.includes('fund')) return Shield;
    if (lowerName.includes('vacation') || lowerName.includes('trip')) return Plane;
    if (lowerName.includes('laptop') || lowerName.includes('computer')) return Laptop;
    return Shield;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savingsData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      goal: formData.goal ? parseFloat(formData.goal) : undefined,
      description: formData.description || undefined,
      createdAt: editingSavings
        ? data.savings.find(s => s.id === editingSavings)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    if (editingSavings) {
      updateSavings(editingSavings, savingsData);
    } else {
      addSavings(savingsData);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      goal: '',
      description: '',
    });
    setEditingSavings(null);
  };

  const handleEdit = (savingsId: string) => {
    const savings = data.savings.find(s => s.id === savingsId);
    if (savings) {
      setFormData({
        name: savings.name,
        amount: savings.amount.toString(),
        goal: savings.goal?.toString() || '',
        description: savings.description || '',
      });
      setEditingSavings(savingsId);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (savingsId: string) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      deleteSavings(savingsId);
    }
  };

  const handleAddMoney = (savingsId: string) => {
    const savings = data.savings.find(s => s.id === savingsId);
    if (savings) {
      const amount = prompt(`Current amount: ${formatCurrency(savings.amount)}\nEnter amount to add:`);
      if (amount && !isNaN(parseFloat(amount))) {
        updateSavings(savingsId, { amount: savings.amount + parseFloat(amount) });
      }
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Savings Goals</h1>
          <p className="text-gray-600">Track your cash savings and financial goals.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Total Savings Summary */}
      {data.savings.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-2">Total Cash Savings</p>
              <p className="text-4xl font-bold mb-2">{formatCurrency(totalSavings)}</p>
              {totalGoals > 0 && (
                <p className="text-purple-200 text-sm">
                  {overallProgress.toFixed(0)}% of your {formatCurrency(totalGoals)} goal reached
                </p>
              )}
            </div>
            {totalGoals > 0 && (
              <div className="text-right">
                <p className="text-purple-200 text-sm mb-2">Overall Progress</p>
                <div className="w-48 bg-purple-500 rounded-full h-3 mb-2">
                  <div
                    className="bg-white h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(overallProgress, 100)}%` }}
                  />
                </div>
                <p className="text-white font-semibold">{overallProgress.toFixed(0)}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Savings Goals */}
      {data.savings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No savings goals tracked yet</p>
          <p className="text-gray-400 mt-2">Start tracking your cash savings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.savings.map((savings) => {
            const progress = savings.goal ? (savings.amount / savings.goal) * 100 : 0;
            const isGoalReached = savings.goal && savings.amount >= savings.goal;
            const Icon = getIcon(savings.name);

            return (
              <div key={savings.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{savings.name}</h3>
                      <p className="text-sm text-gray-600">{formatCurrency(savings.amount)} saved</p>
                    </div>
                  </div>
                  {savings.goal && (
                    <p className="text-sm text-gray-600">Target {formatCurrency(savings.goal)}</p>
                  )}
                </div>

                {savings.goal && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isGoalReached ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{progress.toFixed(0)}% complete</p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleAddMoney(savings.id)}
                    className="flex-1 text-blue-600 hover:text-blue-800 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
                  >
                    Add Money
                  </button>
                  <button
                    onClick={() => handleEdit(savings.id)}
                    className="flex-1 text-gray-700 hover:text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(savings.id)}
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
        title={editingSavings ? 'Edit Savings Goal' : 'New Savings Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Emergency Fund, Vacation, New Laptop"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="Set a savings goal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Add notes about this savings goal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              {editingSavings ? 'Update' : 'Create'} Goal
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

export default Savings;

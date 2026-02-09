import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, PiggyBank, TrendingUp } from 'lucide-react';

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
    if (confirm('Are you sure you want to delete this savings entry?')) {
      deleteSavings(savingsId);
    }
  };

  const handleAddAmount = (savingsId: string) => {
    const savings = data.savings.find(s => s.id === savingsId);
    if (savings) {
      const amount = prompt(`Current amount: ${formatCurrency(savings.amount)}\nEnter amount to add:`);
      if (amount && !isNaN(parseFloat(amount))) {
        updateSavings(savingsId, { amount: savings.amount + parseFloat(amount) });
      }
    }
  };

  const handleSubtractAmount = (savingsId: string) => {
    const savings = data.savings.find(s => s.id === savingsId);
    if (savings) {
      const amount = prompt(`Current amount: ${formatCurrency(savings.amount)}\nEnter amount to subtract:`);
      if (amount && !isNaN(parseFloat(amount))) {
        updateSavings(savingsId, { amount: Math.max(0, savings.amount - parseFloat(amount)) });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Savings (Cash)</h1>
          <p className="text-white/80 mt-2">
            Total Savings: {formatCurrency(totalSavings)}
            {totalGoals > 0 && ` | Goals: ${formatCurrency(totalGoals)}`}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Savings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <PiggyBank className="h-12 w-12 text-green-600" />
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Savings</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
        </div>

        {totalGoals > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-12 w-12 text-blue-600" />
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalGoals)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {data.savings.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-12 text-center shadow-lg">
          <PiggyBank className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No savings tracked yet</p>
          <p className="text-gray-400 mt-2">Start tracking your cash savings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.savings.map((savings) => {
            const progress = savings.goal ? (savings.amount / savings.goal) * 100 : 0;
            const isGoalReached = savings.goal && savings.amount >= savings.goal;

            return (
              <div key={savings.id} className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{savings.name}</h3>
                    {savings.description && (
                      <p className="text-sm text-gray-600 mt-1">{savings.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(savings.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(savings.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Current Amount</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(savings.amount)}
                      </span>
                    </div>

                    {savings.goal && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              isGoalReached ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Goal: {formatCurrency(savings.goal)}</span>
                          <span className={`font-semibold ${isGoalReached ? 'text-green-600' : 'text-blue-600'}`}>
                            {progress.toFixed(1)}%
                            {isGoalReached && ' ✓'}
                          </span>
                        </div>
                        {savings.amount < savings.goal && (
                          <p className="text-sm text-gray-500 mt-1">
                            {formatCurrency(savings.goal - savings.amount)} remaining
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4 border-t">
                    <button
                      onClick={() => handleAddAmount(savings.id)}
                      className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => handleSubtractAmount(savings.id)}
                      className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                    >
                      Subtract
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Created: {formatDate(savings.createdAt)}
                  </p>
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
        title={editingSavings ? 'Edit Savings' : 'Add New Savings'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Savings Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Emergency Fund, Vacation Fund"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount (Optional)</label>
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
              placeholder="Add notes about this savings"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {editingSavings ? 'Update' : 'Add'} Savings
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

export default Savings;

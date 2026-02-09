import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';

const Loans = () => {
  const { data, addLoan, updateLoan, deleteLoan } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    remainingAmount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    monthlyPayment: '',
    lender: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loanData = {
      name: formData.name,
      totalAmount: parseFloat(formData.totalAmount),
      remainingAmount: parseFloat(formData.remainingAmount),
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      startDate: formData.startDate,
      dueDate: formData.dueDate || undefined,
      monthlyPayment: formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : undefined,
      lender: formData.lender,
    };

    if (editingLoan) {
      updateLoan(editingLoan, loanData);
    } else {
      addLoan(loanData);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      totalAmount: '',
      remainingAmount: '',
      interestRate: '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      monthlyPayment: '',
      lender: '',
    });
    setEditingLoan(null);
  };

  const handleEdit = (loanId: string) => {
    const loan = data.loans.find(l => l.id === loanId);
    if (loan) {
      setFormData({
        name: loan.name,
        totalAmount: loan.totalAmount.toString(),
        remainingAmount: loan.remainingAmount.toString(),
        interestRate: loan.interestRate?.toString() || '',
        startDate: loan.startDate,
        dueDate: loan.dueDate || '',
        monthlyPayment: loan.monthlyPayment?.toString() || '',
        lender: loan.lender,
      });
      setEditingLoan(loanId);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (loanId: string) => {
    if (confirm('Are you sure you want to delete this loan?')) {
      deleteLoan(loanId);
    }
  };

  const totalRemaining = data.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Loans Tracker</h1>
          <p className="text-white/80 mt-2">Total Remaining: {formatCurrency(totalRemaining)}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Loan</span>
        </button>
      </div>

      {data.loans.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-12 text-center shadow-lg">
          <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No loans tracked yet</p>
          <p className="text-gray-400 mt-2">Add your first loan to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.loans.map((loan) => {
            const progress = (1 - loan.remainingAmount / loan.totalAmount) * 100;
            return (
              <div key={loan.id} className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{loan.name}</h3>
                    <p className="text-sm text-gray-500">{loan.lender}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(loan.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(loan.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold">{formatCurrency(loan.remainingAmount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(loan.totalAmount - loan.remainingAmount)} paid of {formatCurrency(loan.totalAmount)}
                    </p>
                  </div>

                  {loan.interestRate && (
                    <p className="text-sm text-gray-600">
                      Interest Rate: <span className="font-semibold">{loan.interestRate}%</span>
                    </p>
                  )}

                  {loan.monthlyPayment && (
                    <p className="text-sm text-gray-600">
                      Monthly Payment: <span className="font-semibold">{formatCurrency(loan.monthlyPayment)}</span>
                    </p>
                  )}

                  {loan.dueDate && (
                    <p className="text-sm text-gray-600">
                      Due Date: <span className="font-semibold">{formatDate(loan.dueDate)}</span>
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    Started: {formatDate(loan.startDate)}
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
        title={editingLoan ? 'Edit Loan' : 'Add New Loan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lender</label>
            <input
              type="text"
              required
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.remainingAmount}
                onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {editingLoan ? 'Update' : 'Add'} Loan
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

export default Loans;

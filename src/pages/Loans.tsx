import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, ArrowRight, ArrowLeft, User } from 'lucide-react';

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
    type: 'borrowed' as 'lent' | 'borrowed',
    status: 'pending' as 'pending' | 'paid',
  });

  const lentLoans = data.loans.filter(l => l.type === 'lent');
  const borrowedLoans = data.loans.filter(l => l.type === 'borrowed');

  const totalLent = lentLoans.reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalBorrowed = borrowedLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

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
      type: formData.type,
      status: formData.status,
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
      type: 'borrowed',
      status: 'pending',
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
        type: loan.type || 'borrowed',
        status: loan.status || 'pending',
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

  const handleMarkAsPaid = (loanId: string) => {
    updateLoan(loanId, { status: 'paid', remainingAmount: 0 });
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Loans Tracker</h1>
          <p className="text-gray-600">Track money you owe and money owed to you.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-2">You are owed</p>
          <p className="text-4xl font-bold text-gray-900">{formatCurrency(totalLent)}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-2">You owe</p>
          <p className="text-4xl font-bold text-gray-900">{formatCurrency(totalBorrowed)}</p>
        </div>
      </div>

      {/* Loan Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lent Loans */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <ArrowRight className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Lent (Assets)</h2>
          </div>
          {lentLoans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No loans lent</p>
          ) : (
            <div className="space-y-4">
              {lentLoans.map((loan) => (
                <div key={loan.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{loan.name}</p>
                        <p className="text-sm text-gray-500">Due {loan.dueDate ? formatDate(loan.dueDate) : 'N/A'}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(loan.remainingAmount)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      loan.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {loan.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    {loan.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkAsPaid(loan.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Mark as Paid
                      </button>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(loan.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loan.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Borrowed Loans */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <ArrowLeft className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Borrowed (Liabilities)</h2>
          </div>
          {borrowedLoans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No loans borrowed</p>
          ) : (
            <div className="space-y-4">
              {borrowedLoans.map((loan) => (
                <div key={loan.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{loan.lender}</p>
                        <p className="text-sm text-gray-500">Due {loan.dueDate ? formatDate(loan.dueDate) : 'N/A'}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(loan.remainingAmount)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      loan.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {loan.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    {loan.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkAsPaid(loan.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Mark as Paid
                      </button>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(loan.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loan.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="borrowed">Borrowed (You owe)</option>
              <option value="lent">Lent (You are owed)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === 'borrowed' ? 'Lender Name' : 'Borrower Name'}
            </label>
            <input
              type="text"
              required
              value={formData.type === 'borrowed' ? formData.lender : formData.name}
              onChange={(e) => {
                if (formData.type === 'borrowed') {
                  setFormData({ ...formData, lender: e.target.value });
                } else {
                  setFormData({ ...formData, name: e.target.value });
                }
              }}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              {editingLoan ? 'Update' : 'Add'} Loan
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

export default Loans;

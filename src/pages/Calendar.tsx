import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getDaysInMonth, getDailySpending, formatDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, isSameMonth, isToday, parseISO } from 'date-fns';
import Modal from '../components/Modal';

const Calendar = () => {
  const { data, addTransaction } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
  });

  const days = getDaysInMonth(currentDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get first day of week for the month start
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: format(date, 'yyyy-MM-dd'),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      type: formData.type,
      date: formData.date,
    });
    setIsModalOpen(false);
    setFormData({
      amount: '',
      description: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const getDailyAmount = (date: Date) => {
    return getDailySpending(data.transactions, date);
  };

  const getDayColor = (amount: number) => {
    if (amount === 0) return 'bg-gray-100';
    if (amount < 50) return 'bg-green-100';
    if (amount < 100) return 'bg-yellow-100';
    if (amount < 200) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getTextColor = (amount: number) => {
    if (amount === 0) return 'text-gray-500';
    if (amount < 50) return 'text-green-700';
    if (amount < 100) return 'text-yellow-700';
    if (amount < 200) return 'text-orange-700';
    return 'text-red-700';
  };

  const totalMonthSpending = days.reduce((sum, day) => sum + getDailyAmount(day), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Calendar</h1>
          <p className="text-white/80 mt-2">
            Total spending this month: {formatCurrency(totalMonthSpending)}
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              amount: '',
              description: '',
              category: '',
              type: 'expense',
              date: new Date().toISOString().split('T')[0],
            });
            setIsModalOpen(true);
          }}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const amount = getDailyAmount(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`aspect-square p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                  isCurrentMonth ? getDayColor(amount) : 'bg-gray-50'
                } ${isTodayDate ? 'border-purple-500 border-4' : 'border-transparent'}`}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`text-sm font-semibold ${
                      isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                    } ${isTodayDate ? 'text-purple-600' : ''}`}
                  >
                    {format(day, 'd')}
                  </span>
                  {amount > 0 && (
                    <span className={`text-xs font-bold mt-auto ${getTextColor(amount)}`}>
                      {formatCurrency(amount)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded" />
            <span className="text-sm text-gray-600">&lt; $50</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 rounded" />
            <span className="text-sm text-gray-600">$50 - $100</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 rounded" />
            <span className="text-sm text-gray-600">$100 - $200</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded" />
            <span className="text-sm text-gray-600">&gt; $200</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
        }}
        title="Add Transaction"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Food, Transport, Entertainment"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Add Transaction
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedDate(null);
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

export default Calendar;

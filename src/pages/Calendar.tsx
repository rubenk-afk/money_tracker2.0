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
    if (amount < 500) return 'bg-green-100';
    if (amount < 1000) return 'bg-yellow-100';
    if (amount < 2000) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getTextColor = (amount: number) => {
    if (amount === 0) return 'text-gray-500';
    if (amount < 500) return 'text-green-700';
    if (amount < 1000) return 'text-yellow-700';
    if (amount < 2000) return 'text-orange-700';
    return 'text-red-700';
  };

  const totalMonthSpending = days.reduce((sum, day) => sum + getDailyAmount(day), 0);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Spending Calendar</h1>
          <p className="text-gray-600">View your daily spending at a glance.</p>
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
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square min-h-[60px]" />
              ))}
              {days.map((day) => {
                const amount = getDailyAmount(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square min-h-[60px] p-1.5 rounded-lg transition-all hover:bg-gray-50 ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isTodayDate ? 'ring-2 ring-purple-500' : ''}`}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-xs font-semibold mb-0.5 ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isTodayDate ? 'text-purple-600' : ''}`}
                      >
                        {format(day, 'd')}
                      </span>
                      {amount > 0 && (
                        <>
                          <span className={`text-[10px] font-bold truncate ${getTextColor(amount)}`}>
                            {formatCurrency(amount)}
                          </span>
                          <div className={`mt-0.5 h-0.5 rounded ${getDayColor(amount).replace('bg-', 'bg-').replace('-100', '-500')}`} />
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
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
              className="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Add Transaction
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedDate(null);
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

export default Calendar;

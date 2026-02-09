import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Bell, CheckCircle2 } from 'lucide-react';

const Reminders = () => {
  const { data, addReminder, updateReminder, deleteReminder } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'recharge' as 'recharge' | 'autopay',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringInterval: '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reminderData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      dueDate: formData.dueDate,
      isCompleted: false,
      recurring: formData.isRecurring ? {
        frequency: formData.recurringFrequency,
        interval: parseInt(formData.recurringInterval),
      } : undefined,
    };

    if (editingReminder) {
      updateReminder(editingReminder, reminderData);
    } else {
      addReminder(reminderData);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'recharge',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      isRecurring: false,
      recurringFrequency: 'monthly',
      recurringInterval: '1',
    });
    setEditingReminder(null);
  };

  const handleEdit = (reminderId: string) => {
    const reminder = data.reminders.find(r => r.id === reminderId);
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description,
        type: reminder.type,
        amount: reminder.amount?.toString() || '',
        dueDate: reminder.dueDate,
        isRecurring: !!reminder.recurring,
        recurringFrequency: reminder.recurring?.frequency || 'monthly',
        recurringInterval: reminder.recurring?.interval.toString() || '1',
      });
      setEditingReminder(reminderId);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (reminderId: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder(reminderId);
    }
  };

  const handleToggleComplete = (reminderId: string) => {
    const reminder = data.reminders.find(r => r.id === reminderId);
    if (reminder) {
      updateReminder(reminderId, { isCompleted: !reminder.isCompleted });
    }
  };

  const activeReminders = data.reminders.filter(r => !r.isCompleted);
  const completedReminders = data.reminders.filter(r => r.isCompleted);
  const upcomingReminders = activeReminders.filter(r => {
    const dueDate = new Date(r.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reminders</h1>
          <p className="text-gray-600">Stay on top of your bills and subscriptions.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Add Reminder</span>
        </button>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Upcoming</h2>
        </div>
        {activeReminders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No active reminders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">
                      {new Date(reminder.dueDate).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{reminder.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">
                        {reminder.type === 'recharge' ? 'Recharge' : reminder.type === 'autopay' ? 'Subscription' : 'Bill'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">Due {formatDate(reminder.dueDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {reminder.amount && (
                    <p className="font-bold text-gray-900">{formatCurrency(reminder.amount)}</p>
                  )}
                  <button
                    onClick={() => handleToggleComplete(reminder.id)}
                    className="text-green-600 hover:text-green-800"
                    title="Mark as completed"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(reminder.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedReminders.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Recently Paid</h2>
          </div>
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">No history yet.</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="recharge">Recharge</option>
              <option value="autopay">Auto Pay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Phone Recharge, Credit Card Payment"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Optional)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
              Recurring Reminder
            </label>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formData.recurringFrequency}
                  onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                <input
                  type="number"
                  min="1"
                  value={formData.recurringInterval}
                  onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {editingReminder ? 'Update' : 'Add'} Reminder
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

export default Reminders;

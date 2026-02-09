import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthlySpending, formatDate } from '../utils/dateUtils';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { data } = useApp();

  const stats = useMemo(() => {
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSavings = data.savings.reduce((sum, s) => sum + s.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalSavings,
    };
  }, [data]);

  const recentTransactions = data.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const spendingData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const spending = data.transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spending: spending,
      };
    });
    return last7Days;
  }, [data.transactions]);

  const budgetStatus = useMemo(() => {
    return data.budgets.map(budget => {
      const spent = data.transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
      };
    }).slice(0, 4);
  }, [data.budgets, data.transactions]);

  const upcomingReminders = data.reminders
    .filter(r => !r.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, here's your financial overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.balance)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Income</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalIncome)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Savings</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalSavings)}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Analytics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Spending Analytics</h2>
            <Link to="/analytics" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">
              View Report <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line 
                type="monotone" 
                dataKey="spending" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className={`h-5 w-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-lg ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Budget Status</h2>
          {budgetStatus.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No budgets set yet</p>
          ) : (
            <div className="space-y-4">
              {budgetStatus.map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{budget.category}</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Reminders</h2>
          {upcomingReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming reminders</p>
          ) : (
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">
                        {new Date(reminder.dueDate).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{reminder.title}</p>
                      <p className="text-sm text-gray-500">
                        {reminder.type === 'recharge' ? 'Recharge' : 'Auto Pay'} • Due {formatDate(reminder.dueDate)}
                      </p>
                    </div>
                  </div>
                  {reminder.amount && (
                    <p className="font-bold text-gray-900">{formatCurrency(reminder.amount)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

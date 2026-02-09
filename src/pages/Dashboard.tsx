import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthlySpending } from '../utils/dateUtils';
import { Plus, TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

const Dashboard = () => {
  const { data } = useApp();

  const stats = useMemo(() => {
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySpending = getMonthlySpending(data.transactions);
    const totalLoans = data.loans.reduce((sum, l) => sum + l.remainingAmount, 0);
    const totalSavings = data.savings.reduce((sum, s) => sum + s.amount, 0);
    const upcomingReminders = data.reminders
      .filter(r => !r.isCompleted)
      .filter(r => new Date(r.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      .length;

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthlySpending,
      totalLoans,
      totalSavings,
      upcomingReminders,
    };
  }, [data]);

  const recentTransactions = data.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Balance</p>
              <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
            <Wallet className="h-12 w-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Spending</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.monthlySpending)}
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Loans</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(stats.totalLoans)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-600" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Savings</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalSavings)}
              </p>
            </div>
            <Wallet className="h-12 w-12 text-green-600" />
          </div>
        </div>
      </div>

      {stats.upcomingReminders > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">
              You have {stats.upcomingReminders} upcoming reminder{stats.upcomingReminders > 1 ? 's' : ''}
            </p>
            <Link to="/reminders" className="text-yellow-600 hover:underline text-sm">
              View reminders →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                  <p
                    className={`font-bold ${
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

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/loans"
              className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-center"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold text-gray-800">Manage Loans</p>
            </Link>
            <Link
              to="/budget"
              className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-center"
            >
              <Wallet className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-gray-800">Set Budget</p>
            </Link>
            <Link
              to="/reminders"
              className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors text-center"
            >
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="font-semibold text-gray-800">Reminders</p>
            </Link>
            <Link
              to="/savings"
              className="p-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-center"
            >
              <Wallet className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-gray-800">Savings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

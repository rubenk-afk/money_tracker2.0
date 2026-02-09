import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthlySpending } from '../utils/dateUtils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const Analytics = () => {
  const { data } = useApp();

  const categorySpending = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    data.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data.transactions]);

  const last7DaysData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const spending = data.transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        spending: spending,
      };
    });
    return days;
  }, [data.transactions]);

  const stats = useMemo(() => {
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySpending = getMonthlySpending(data.transactions);
    const avgTransaction = data.transactions.length > 0
      ? totalExpenses / data.transactions.filter(t => t.type === 'expense').length
      : 0;

    return {
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
      monthlySpending,
      avgTransaction,
      transactionCount: data.transactions.length,
    };
  }, [data.transactions]);

  const topCategories = categorySpending.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
        <p className="text-gray-600">Visualize your spending patterns and trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Income</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <TrendingDown className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Net Balance</p>
              <p className={`text-3xl font-bold ${stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.net)}
              </p>
            </div>
            <DollarSign className={`h-12 w-12 ${stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Transaction</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.avgTransaction)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
          {categorySpending.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No spending data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Last 7 Days Spending</h2>
          {last7DaysData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No spending data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="spending" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Spending Categories</h2>
        {topCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No spending data available</p>
        ) : (
          <div className="space-y-4">
            {topCategories.map((category, index) => {
              const percentage = (category.value / stats.totalExpenses) * 100;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-semibold text-gray-800">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatCurrency(category.value)}</p>
                      <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

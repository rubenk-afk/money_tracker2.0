import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { Wallet, TrendingUp, Calendar, Bell, PieChart, Target, PiggyBank } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Wallet },
    { path: '/loans', label: 'Loans', icon: TrendingUp },
    { path: '/budget', label: 'Budget', icon: Target },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/analytics', label: 'Analytics', icon: PieChart },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/savings', label: 'Savings', icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Money Tracker 2.0</h1>
            </div>
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Bell, 
  PieChart, 
  Target, 
  PiggyBank, 
  Receipt,
  LayoutGrid,
  ArrowLeftRight,
  FileText,
  Clock
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutGrid },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/loans', label: 'Loans', icon: FileText },
    { path: '/budget', label: 'Budget', icon: Target },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/analytics', label: 'Analytics', icon: Clock },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/savings', label: 'Savings', icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-purple-600">FinanceFlow</h1>
          </div>
          
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-purple-50 text-purple-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

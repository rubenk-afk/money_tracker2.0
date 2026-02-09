import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Loans from './pages/Loans';
import Budget from './pages/Budget';
import Reminders from './pages/Reminders';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Savings from './pages/Savings';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/savings" element={<Savings />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;

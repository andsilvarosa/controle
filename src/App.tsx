
import React, { useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Rules from './pages/Rules';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, checkSession, view } = useFinanceStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-600 font-medium">Carregando SOS Controle...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  // Roteamento simples baseado no estado 'view' do store
  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'wallets': return <Wallets />;
      case 'categories': return <Categories />;
      case 'budgets': return <Budgets />;
      case 'rules': return <Rules />;
      case 'settings': return <Settings />;
      case 'calendar': return <Calendar />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderView()}
    </div>
  );
};

export default App;

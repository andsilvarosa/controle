
import React, { Suspense, lazy, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { FloatingActionButton } from './components/UI/FloatingActionButton';
import { TransactionModal } from './components/UI/TransactionModal';
import { CategoryModal } from './components/UI/CategoryModal';
import { RuleModal } from './components/UI/RuleModal';
import { ProfileModal } from './components/UI/ProfileModal';
import { SecurityModal } from './components/UI/SecurityModal';
import { RecurrenceActionModal } from './components/UI/RecurrenceActionModal';
import { CommandPalette } from './components/UI/CommandPalette';
import { PwaInstallPrompt } from './components/UI/PwaInstallPrompt';
import { Auth } from './pages/Auth'; 
import { useFinanceStore } from './store/useFinanceStore';
import { usePwaInstall } from './lib/usePwaInstall';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Rules = lazy(() => import('./pages/Rules').then(m => ({ default: m.Rules })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Wallets = lazy(() => import('./pages/Wallets').then(m => ({ default: m.Wallets })));
const Budgets = lazy(() => import('./pages/Budgets').then(m => ({ default: m.Budgets })));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[400px]">
    <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
      <Loader2 size={40} className="animate-spin text-teal-500" />
      <p className="text-sm font-bold animate-pulse tracking-wide">Carregando...</p>
    </div>
  </div>
);

interface PageTransitionProps {
  children: React.ReactNode;
  viewKey: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, viewKey }) => (
  <motion.div
    key={viewKey}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  const { view, isAuthenticated, theme, checkSession, isInitialLoading } = useFinanceStore();
  const { showInstallPrompt, handleInstall, handleDismiss } = usePwaInstall();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando sua sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderContent = () => {
    let Component: React.ReactNode = null;
    switch (view) {
      case 'dashboard': Component = <Dashboard />; break;
      case 'wallets': Component = <Wallets />; break;
      case 'budgets': Component = <Budgets />; break;
      case 'reports': Component = <Reports />; break;
      case 'rules': Component = <Rules />; break;
      case 'categories': Component = <Categories />; break;
      case 'calendar': Component = <Calendar />; break;
      case 'settings': Component = <Settings />; break;
      default: Component = <Dashboard />;
    }
    return <PageTransition viewKey={view}>{Component}</PageTransition>;
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#020617] overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto h-full relative">
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </Suspense>
          </div>
        </main>
      </div>
      <FloatingActionButton />
      <CommandPalette /> 
      <AnimatePresence>
        <TransactionModal key="transaction-modal" />
        <CategoryModal key="category-modal" />
        <RuleModal key="rule-modal" />
        <ProfileModal key="profile-modal" />
        <SecurityModal key="security-modal" />
        <RecurrenceActionModal key="recurrence-modal" />
      </AnimatePresence>
      <PwaInstallPrompt 
        show={showInstallPrompt} 
        onInstall={handleInstall} 
        onDismiss={handleDismiss}
      />
    </div>
  );
};

export default App;

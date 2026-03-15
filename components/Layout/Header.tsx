import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Menu, X, AlertCircle, Clock, Sparkles, Eye, EyeOff, Calendar, Moon, Sun } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  // 👇 A CORREÇÃO MÁGICA: Estados que afetam o site inteiro voltam para o FinanceStore
  const { view, transactions, user, isPrivacyMode, togglePrivacyMode, theme, toggleTheme } = useFinanceStore();
  
  // 👇 O menu mobile fica isolado e rápido no UIStore
  const { setMobileMenuOpen } = useUIStore();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const viewTitles: Record<string, string> = {
    dashboard: 'Visão Geral',
    wallets: 'Gestão de Carteiras',
    budgets: 'Metas Orçamentárias',
    calendar: 'Agenda Financeira',
    reports: 'Inteligência de Dados',
    categories: 'Categorização',
    rules: 'Automação',
    settings: 'Preferências'
  };

  const notifications = useMemo(() => {
    const now = new Date();
    const toDateStr = (d: Date) => d.toLocaleDateString('sv-SE'); 

    const todayStr = toDateStr(now);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrow);

    const limit = new Date(now);
    limit.setDate(limit.getDate() + 3);
    const limitStr = toDateStr(limit);

    return transactions
      .filter(t => !t.isPaid && t.dueDate <= limitStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map(t => {
         let status = { 
             label: 'Próximo ao Vencimento', 
             style: 'bg-blue-50 text-blue-600 border-blue-100', 
             icon: Calendar 
         };

         if (t.dueDate < todayStr) {
             status = { 
                 label: 'Vencido', 
                 style: 'bg-red-50 text-red-600 border-red-100', 
                 icon: AlertCircle 
             };
         } else if (t.dueDate === todayStr) {
             status = { 
                 label: 'Vence Hoje', 
                 style: 'bg-orange-50 text-orange-600 border-orange-100', 
                 icon: Clock 
             };
         } else if (t.dueDate === tomorrowStr) {
             status = { 
                 label: 'Vence Amanhã', 
                 style: 'bg-yellow-50 text-yellow-600 border-yellow-100', 
                 icon: Clock 
             };
         }

         return { ...t, status };
      });
  }, [transactions]);

  const renderNotificationContent = () => (
    <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-slate-900 flex-1">
      {notifications.length > 0 ? (
        notifications.map(n => {
          const StatusIcon = n.status.icon;
          
          return (
            <div key={n.id} className="group relative bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-100 dark:hover:border-teal-900 transition-all">
              <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                  n.status.label === 'Vencido' ? 'bg-red-500' : 
                  n.status.label === 'Vence Hoje' ? 'bg-orange-500' : 
                  n.status.label === 'Vence Amanhã' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              
              <div className="ml-3">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{n.description}</span>
                  <span className={`text-xs font-black whitespace-nowrap ${
                      n.status.label === 'Vencido' ? 'text-red-600 dark:text-red-400' : 
                      n.status.label === 'Vence Hoje' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'
                  } ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                    {isPrivacyMode ? 'R$ •••' : `R$ ${n.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border dark:bg-opacity-20 ${n.status.style}`}>
                        <StatusIcon size={12} />
                        {n.status.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                        {n.dueDate.split('-').reverse().join('/')}
                    </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-12 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Bell size={24} className="opacity-20" />
          </div>
          <p className="font-bold text-slate-600 dark:text-slate-300">Tudo em dia</p>
          <p className="text-xs mt-1 max-w-[200px]">Nenhum vencimento encontrado para os próximos 3 dias.</p>
        </div>
      )}
    </div>
  );

  return (
    <>
    <header className="sticky top-0 z-[40] bg-[#f8fafc]/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 lg:px-10 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-0.5">
            <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="truncate max-w-[120px] lg:max-w-none">{viewTitles[view] || 'SOS Controle'}</span>
          </div>
          <h1 className="text-lg lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            {view === 'dashboard' ? (
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline">{greeting},</span> 
                <span className="text-teal-600 dark:text-teal-400 truncate max-w-[100px] sm:max-w-none">{user.name.split(' ')[0]}</span>
                <Sparkles size={16} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
              </div>
            ) : (
                <span className="truncate">{viewTitles[view]}</span>
            )}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-2 p-1.5 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md rounded-full shadow-sm">
        
        <button
          onClick={toggleTheme}
          className="p-2 lg:p-2.5 rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all"
          title={theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={togglePrivacyMode}
          className="p-2 lg:p-2.5 rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
          title={isPrivacyMode ? "Mostrar Valores" : "Ocultar Valores"}
        >
          {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 lg:p-2.5 rounded-full transition-all duration-300 border ${
                isNotifOpen 
                ? 'bg-slate-800 text-white border-slate-800 shadow-lg scale-105' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-600 hover:text-teal-600'
            }`}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-bounce"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
                 <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="
                        hidden lg:flex flex-col
                        absolute top-full right-0 mt-4 w-[400px] max-h-[450px] z-[50]
                        bg-white dark:bg-slate-900/95 backdrop-blur-2xl rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-700 ring-1 ring-black/5 overflow-hidden
                    "
                  >
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base">Notificações</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Alertas de Vencimento</p>
                      </div>
                      <button onClick={() => setIsNotifOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                    
                    {renderNotificationContent()}
                  </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

    {isNotifOpen && createPortal(
      <AnimatePresence>
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNotifOpen(false)}
            className="fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-sm lg:hidden"
         />
         
         <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-4 right-4 mx-auto max-w-md z-[9999] bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[75vh] lg:hidden"
         >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Notificações</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Alertas de Vencimento</p>
                </div>
                <button onClick={() => setIsNotifOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                <X size={18} />
                </button>
            </div>
            {renderNotificationContent()}
         </motion.div>
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};

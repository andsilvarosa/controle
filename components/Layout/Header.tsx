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
    <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-brand-dark flex-1">
      {notifications.length > 0 ? (
        notifications.map(n => {
          const StatusIcon = n.status.icon;
          
          return (
            <div key={n.id} className="group relative bg-white dark:bg-brand-dark/50 p-4 rounded-3xl border border-brand-gray/10 dark:border-brand-dark shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all">
              <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                  n.status.label === 'Vencido' ? 'bg-red-500' : 
                  n.status.label === 'Vence Hoje' ? 'bg-orange-500' : 
                  n.status.label === 'Vence Amanhã' ? 'bg-yellow-500' : 'bg-brand-green'
              }`} />
              
              <div className="ml-3">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className="font-black text-brand-dark dark:text-white text-sm line-clamp-1 tracking-tight">{n.description}</span>
                  <span className={`text-xs font-black whitespace-nowrap ${
                      n.status.label === 'Vencido' ? 'text-red-600 dark:text-red-400' : 
                      n.status.label === 'Vence Hoje' ? 'text-orange-600 dark:text-orange-400' : 'text-brand-dark/60 dark:text-brand-gray/60'
                  } ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                    {isPrivacyMode ? 'R$ •••' : `R$ ${n.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border dark:bg-opacity-20 ${n.status.style}`}>
                        <StatusIcon size={12} />
                        {n.status.label}
                    </span>
                    <span className="text-[10px] text-brand-dark/40 dark:text-brand-gray/40 font-black bg-brand-gray/50 dark:bg-brand-dark/80 px-2 py-1 rounded-lg uppercase tracking-tighter">
                        {n.dueDate.split('-').reverse().join('/')}
                    </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-12 text-center text-brand-dark/30 dark:text-brand-gray/30 flex flex-col items-center">
          <div className="w-20 h-20 bg-brand-gray/50 dark:bg-brand-dark/50 rounded-full flex items-center justify-center mb-4 border border-brand-gray/10 dark:border-brand-dark">
            <Bell size={28} className="opacity-20" />
          </div>
          <p className="font-black text-brand-dark/60 dark:text-brand-gray/60 uppercase tracking-widest text-sm">Tudo em dia</p>
          <p className="text-[10px] mt-2 max-w-[200px] font-black uppercase tracking-tighter opacity-50">Nenhum vencimento encontrado para os próximos 3 dias.</p>
        </div>
      )}
    </div>
  );

  return (
    <>
    <header className="sticky top-0 z-[40] bg-brand-gray/80 dark:bg-black/80 backdrop-blur-xl border-b border-brand-gray/20 dark:border-brand-dark/50 px-4 lg:px-10 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2.5 hover:bg-white dark:hover:bg-brand-dark rounded-2xl text-brand-dark/50 dark:text-brand-gray/50 shadow-sm border border-brand-gray/10 dark:border-brand-dark transition-all"
        >
          <Menu size={22} />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-brand-dark/40 dark:text-brand-gray/40 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-0.5">
            <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="truncate max-w-[120px] lg:max-w-none">{viewTitles[view] || 'SOS Controle'}</span>
          </div>
          <h1 className="text-lg lg:text-2xl font-black text-brand-dark dark:text-white tracking-tight flex items-center gap-2">
            {view === 'dashboard' ? (
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline">{greeting},</span> 
                <span className="text-brand-green truncate max-w-[100px] sm:max-w-none">{user.name.split(' ')[0]}</span>
                <Sparkles size={18} className="text-brand-green fill-brand-green flex-shrink-0" />
              </div>
            ) : (
                <span className="truncate">{viewTitles[view]}</span>
            )}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-2 p-1.5 bg-white/60 dark:bg-brand-dark/60 border border-brand-gray/20 dark:border-brand-dark/50 backdrop-blur-md rounded-full shadow-sm">
        
        <button
          onClick={toggleTheme}
          className="p-2.5 lg:p-3 rounded-full hover:bg-white dark:hover:bg-brand-dark text-brand-dark/30 dark:text-brand-gray/30 hover:text-brand-green dark:hover:text-brand-green transition-all"
          title={theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={togglePrivacyMode}
          className="p-2.5 lg:p-3 rounded-full hover:bg-white dark:hover:bg-brand-dark text-brand-dark/30 dark:text-brand-gray/30 hover:text-brand-green dark:hover:text-brand-green transition-all"
          title={isPrivacyMode ? "Mostrar Valores" : "Ocultar Valores"}
        >
          {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2.5 lg:p-3 rounded-full transition-all duration-300 border ${
                isNotifOpen 
                ? 'bg-brand-green text-white border-brand-green shadow-xl scale-105' 
                : 'bg-brand-gray dark:bg-brand-dark/50 text-brand-dark/30 dark:text-brand-gray/30 border-transparent hover:bg-white dark:hover:bg-brand-dark hover:text-brand-green'
            }`}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-brand-dark rounded-full animate-bounce"></span>
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
                        bg-white dark:bg-brand-dark/95 backdrop-blur-2xl rounded-4xl shadow-2xl border border-brand-gray/10 dark:border-brand-dark ring-1 ring-black/5 overflow-hidden
                    "
                  >
                    <div className="p-5 border-b border-brand-gray/10 dark:border-brand-dark flex items-center justify-between bg-brand-gray/50 dark:bg-brand-dark/50 shrink-0">
                      <div>
                        <h3 className="font-black text-brand-dark dark:text-white text-base uppercase tracking-widest">Notificações</h3>
                        <p className="text-[10px] text-brand-dark/40 dark:text-brand-gray/40 font-black uppercase tracking-tighter">Alertas de Vencimento</p>
                      </div>
                      <button onClick={() => setIsNotifOpen(false)} className="p-2.5 hover:bg-brand-gray dark:hover:bg-brand-dark rounded-2xl text-brand-dark/30 transition-colors">
                        <X size={20} />
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
            className="fixed top-24 left-4 right-4 mx-auto max-w-md z-[9999] bg-white dark:bg-brand-dark rounded-4xl shadow-2xl border border-brand-gray/10 dark:border-brand-dark overflow-hidden flex flex-col max-h-[75vh] lg:hidden"
         >
            <div className="p-5 border-b border-brand-gray/10 dark:border-brand-dark flex items-center justify-between bg-brand-gray/50 dark:bg-brand-dark/50 shrink-0">
                <div>
                <h3 className="font-black text-brand-dark dark:text-white text-base uppercase tracking-widest">Notificações</h3>
                <p className="text-[10px] text-brand-dark/40 dark:text-brand-gray/40 font-black uppercase tracking-tighter">Alertas de Vencimento</p>
                </div>
                <button onClick={() => setIsNotifOpen(false)} className="p-2.5 hover:bg-brand-gray dark:hover:bg-brand-dark rounded-2xl text-brand-dark/30 transition-colors">
                <X size={20} />
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

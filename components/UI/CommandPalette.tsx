import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Home, CreditCard, Target, PieChart, 
  CalendarDays, Zap, Settings, Plus, Eye, EyeOff, LogOut 
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { 
    setView, 
    togglePrivacyMode, 
    isPrivacyMode, 
    setActiveModal, 
    logout 
  } = useFinanceStore();

  // Ações disponíveis
  const actions = useMemo(() => [
    // Navegação
    { id: 'nav-dashboard', label: 'Ir para Dashboard', icon: Home, group: 'Navegação', action: () => setView('dashboard') },
    { id: 'nav-wallets', label: 'Ir para Carteiras', icon: CreditCard, group: 'Navegação', action: () => setView('wallets') },
    { id: 'nav-budgets', label: 'Ir para Metas e Orçamentos', icon: Target, group: 'Navegação', action: () => setView('budgets') },
    { id: 'nav-reports', label: 'Ir para Relatórios', icon: PieChart, group: 'Navegação', action: () => setView('reports') },
    { id: 'nav-calendar', label: 'Ir para Calendário', icon: CalendarDays, group: 'Navegação', action: () => setView('calendar') },
    { id: 'nav-settings', label: 'Ir para Configurações', icon: Settings, group: 'Navegação', action: () => setView('settings') },
    
    // Ações Rápidas
    { id: 'act-new-income', label: 'Nova Receita', icon: Plus, group: 'Ações', action: () => setActiveModal('income') },
    { id: 'act-new-expense', label: 'Nova Despesa', icon: Plus, group: 'Ações', action: () => setActiveModal('expense') },
    { id: 'act-toggle-privacy', label: isPrivacyMode ? 'Mostrar Valores' : 'Ocultar Valores (Privacidade)', icon: isPrivacyMode ? Eye : EyeOff, group: 'Preferências', action: () => togglePrivacyMode() },
    
    // Sistema
    { id: 'sys-logout', label: 'Sair do Sistema', icon: LogOut, group: 'Sistema', action: () => logout() },
  ], [isPrivacyMode, setView, setActiveModal, togglePrivacyMode, logout]);

  // Filtragem
  const filteredActions = useMemo(() => {
    if (!query) return actions;
    return actions.filter(action => 
      action.label.toLowerCase().includes(query.toLowerCase()) ||
      action.group.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, actions]);

  // Atalho de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navegação nas setas
  useEffect(() => {
    const handleArrowNav = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleArrowNav);
    return () => window.removeEventListener('keydown', handleArrowNav);
  }, [isOpen, filteredActions, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh]"
          >
            {/* Search Bar */}
            <div className="flex items-center px-4 py-4 border-b border-slate-100 gap-3">
              <Search className="text-slate-400" size={20} />
              <input 
                autoFocus
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="O que você deseja fazer?"
                className="flex-1 text-lg bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-300 font-medium h-full outline-none"
              />
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">ESC</span>
                <span className="text-[10px] text-slate-300">para fechar</span>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 scrollbar-hide">
              {filteredActions.length > 0 ? (
                <div className="space-y-1">
                  {filteredActions.map((action, index) => (
                    <button
                      key={action.id}
                      onClick={() => { action.action(); setIsOpen(false); }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        index === selectedIndex 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-teal-100/50' : 'bg-slate-100'}`}>
                           <action.icon size={18} />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-bold ${index === selectedIndex ? 'text-teal-800' : 'text-slate-700'}`}>
                            {action.label}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                            {action.group}
                          </p>
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <ArrowRight size={16} className="text-teal-500" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p>Nenhum comando encontrado para "{query}".</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-bold flex justify-between">
               <span>SOS Controle Command</span>
               <div className="flex gap-2">
                 <span>↑↓ para navegar</span>
                 <span>↵ para selecionar</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
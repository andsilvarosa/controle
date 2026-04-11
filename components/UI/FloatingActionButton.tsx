
import React, { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveModal, setEditingTransaction } = useFinanceStore();

  const handleAction = (type: 'income' | 'expense') => {
    setEditingTransaction(null);
    setActiveModal(type);
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[50]" 
            onClick={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center">
        <div className="relative flex items-center">
            
            {/* Botão de Receita (Expande para a Esquerda) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.button
                        initial={{ x: 0, opacity: 0, scale: 0.5 }}
                        animate={{ x: -70, opacity: 1, scale: 1 }}
                        exit={{ x: 0, opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => handleAction('income')}
                        className="absolute left-0 w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 hover:bg-teal-400 transition-colors z-10"
                        title="Nova Receita"
                    >
                        <ArrowUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Botão de Despesa (Expande para a Direita) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.button
                        initial={{ x: 0, opacity: 0, scale: 0.5 }}
                        animate={{ x: 70, opacity: 1, scale: 1 }}
                        exit={{ x: 0, opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => handleAction('expense')}
                        className="absolute right-0 w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-400 transition-colors z-10"
                        title="Nova Despesa"
                    >
                        <ArrowDown size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Botão Principal (Gatilho) */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative z-20 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                    border border-white/10 backdrop-blur-md shadow-sm
                    ${isOpen 
                        ? 'bg-slate-800 text-white rotate-90 shadow-xl scale-110' 
                        : 'bg-slate-200/30 dark:bg-black/30 text-slate-600 dark:text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-110 hover:shadow-xl hover:border-transparent'
                    }
                `}
            >
                {isOpen ? <X size={24} /> : <Plus size={28} strokeWidth={2.5} />}
            </motion.button>

            {/* Labels Flutuantes (Opcional, aparecem quando aberto) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -35, x: -70 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-0 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm whitespace-nowrap pointer-events-none"
                        >
                            Entrada
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -35, x: 70 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-0 text-[10px] font-bold text-red-600 dark:text-red-400 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm whitespace-nowrap pointer-events-none"
                        >
                            Saída
                        </motion.span>
                    </>
                )}
            </AnimatePresence>

        </div>
      </div>
    </>
  );
};

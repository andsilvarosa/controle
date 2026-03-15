
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCcw, AlertTriangle, Zap, TrendingUp, X } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

export const RecurrenceActionModal: React.FC = () => {
  const { activeModal, setActiveModal, recurrencePendingAction, confirmRecurrenceAction } = useFinanceStore();

  if (activeModal !== 'recurrence-action' || !recurrencePendingAction) return null;

  const { type, transaction, newTransactionData } = recurrencePendingAction;
  const isDelete = type === 'delete';
  
  // Detecta se houve mudança de valor para personalizar a mensagem
  const isAmountChange = newTransactionData && transaction.amount !== newTransactionData.amount;
  const oldValue = transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const newValue = newTransactionData?.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={() => setActiveModal(null)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header Visual */}
        <div className="relative bg-slate-50 dark:bg-slate-900/50 p-6 pb-8 border-b border-slate-100 dark:border-slate-700 text-center">
           <button 
             onClick={() => setActiveModal(null)}
             className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
           >
             <X size={20} />
           </button>

           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isDelete ? 'bg-red-100 text-red-500' : 'bg-indigo-100 text-indigo-600'}`}>
              {isDelete ? <AlertTriangle size={32} /> : <Zap size={32} fill="currentColor" className="opacity-20" />}
              {!isDelete && <Zap size={32} className="absolute" />}
           </div>
           
           <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
             {isDelete ? 'Excluir Recorrência' : 'Alteração de Recorrência'}
           </h3>
           
           {isAmountChange && !isDelete ? (
             <div className="mt-3 inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm">
                <span className="text-xs font-bold text-slate-400 line-through">{oldValue}</span>
                <span className="text-slate-300">→</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{newValue}</span>
             </div>
           ) : (
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 px-4">
               Você está alterando <strong>{transaction.description}</strong>. Como devemos processar isso?
             </p>
           )}
        </div>

        {/* Options Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
           
           {/* Option: Single (Variable Bill Scenario) */}
           <button 
             onClick={() => confirmRecurrenceAction('single')}
             className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all group text-left relative overflow-hidden"
           >
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition-transform">
                 <Calendar size={24} />
              </div>
              <div className="flex-1 z-10">
                 <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 dark:text-white text-base group-hover:text-teal-700 dark:group-hover:text-teal-400">
                        Apenas este mês
                    </p>
                    {!isDelete && (
                        <span className="bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Variável
                        </span>
                    )}
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isDelete 
                        ? 'Remove o lançamento somente desta competência. Os próximos meses permanecem agendados.' 
                        : 'Ideal para contas de consumo (Luz, Água) onde o valor varia mensalmente. Não afeta os meses seguintes.'}
                 </p>
              </div>
           </button>

           {/* Option: All (Contract Change Scenario) */}
           <button 
             onClick={() => confirmRecurrenceAction('all')}
             className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group text-left"
           >
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                 <RefreshCcw size={24} />
              </div>
              <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 dark:text-white text-base group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                        Todos os futuros
                    </p>
                    {!isDelete && (
                        <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Fixo
                        </span>
                    )}
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isDelete 
                        ? 'Cancela a assinatura/conta. Exclui este e impede que novos lançamentos sejam gerados.' 
                        : 'Use para reajustes de contrato (Aluguel, Internet). Atualiza o valor padrão para sempre.'}
                 </p>
              </div>
           </button>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium">
               A alteração será aplicada imediatamente ao seu fluxo de caixa.
            </p>
        </div>
      </motion.div>
    </div>
  );
};

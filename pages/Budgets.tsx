
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Pencil, Trash2, XCircle, X } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Budget } from '../types';

export const Budgets: React.FC = () => {
  const { 
    budgets, categories, transactions, 
    addBudget, updateBudget, deleteBudget, 
    isPrivacyMode, 
    editingBudget, setEditingBudget 
  } = useFinanceStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ categoryId: '', amount: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Calcula o gasto atual da categoria no mês corrente
  const getSpent = (categoryId: string) => {
    const now = new Date();
    return transactions
      .filter(t => 
        t.categoryId === categoryId && 
        t.type === 'expense' && 
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
      )
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setFormData({ categoryId: '', amount: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({ 
      categoryId: budget.categoryId, 
      amount: budget.amount.toString() 
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
    setFormData({ categoryId: '', amount: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount) return;

    const amountVal = parseFloat(formData.amount);

    if (editingBudget) {
      updateBudget({
        ...editingBudget,
        categoryId: formData.categoryId,
        amount: amountVal
      });
    } else {
      addBudget({
        id: Date.now().toString(),
        categoryId: formData.categoryId,
        amount: amountVal,
        period: 'monthly'
      });
    }
    handleCloseForm();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      deleteBudget(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-slate-800 dark:text-white">Orçamento Mensal</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Defina limites e acompanhe seus gastos.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={handleOpenCreate}
            className="bg-teal-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2 hover:bg-teal-600 transition-all active:scale-95"
          >
            <Plus size={18} />
            Nova Meta
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl mb-8 relative">
               <button 
                 onClick={handleCloseForm}
                 className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full text-slate-400 transition-colors"
               >
                 <X size={20} />
               </button>

               <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {editingBudget ? 'Editar Meta' : 'Nova Meta de Orçamento'}
                  </h3>
               </div>

               <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="w-full md:flex-1 space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Categoria</label>
                   <select 
                     value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold appearance-none text-slate-700 dark:text-white"
                   >
                     <option value="" disabled>Selecione...</option>
                     {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
                 <div className="w-full md:w-48 space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Limite (R$)</label>
                   <input 
                     type="number"
                     value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white" placeholder="0.00"
                   />
                 </div>
                 <button type="submit" className="w-full md:w-auto px-6 py-3 bg-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors">
                    {editingBudget ? 'Salvar' : 'Criar'}
                 </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const category = categories.find(c => c.id === budget.categoryId);
          const spent = getSpent(budget.categoryId);
          const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 100;
          const isConfirming = deleteConfirmId === budget.id;
          
          let statusColor = 'bg-teal-500';
          if (percentage > 75) statusColor = 'bg-orange-500';
          if (percentage >= 100) statusColor = 'bg-red-500';

          return (
            <motion.div 
              key={budget.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: category?.color || '#cbd5e1' }}>
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{category?.name || 'Categoria Removida'}</h3>
                    <p className={`text-xs font-bold ${percentage >= 100 ? 'text-red-500' : 'text-slate-400'}`}>
                      {percentage >= 100 ? 'Limite Excedido!' : `${(100 - percentage).toFixed(0)}% restante`}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className={`flex items-center gap-1 transition-all duration-300 ${isConfirming ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {!isConfirming && (
                        <button 
                            onClick={() => handleEdit(budget)}
                            className="p-2 text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Pencil size={18} />
                        </button>
                    )}
                    <button 
                        onClick={(e) => handleDelete(e, budget.id)}
                        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                            isConfirming 
                            ? 'bg-red-500 text-white px-3 shadow-md ring-2 ring-red-200 z-10' 
                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title="Excluir"
                    >
                        {isConfirming ? (
                            <>
                                <XCircle size={18} />
                                <span className="text-xs font-bold whitespace-nowrap">Confirmar?</span>
                            </>
                        ) : (
                            <Trash2 size={18} />
                        )}
                    </button>
                </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between text-sm font-bold">
                    <span className={`text-slate-600 dark:text-slate-300 ${isPrivacyMode ? 'blur-sm' : ''}`}>R$ {spent.toFixed(0)}</span>
                    <span className={`text-slate-400 dark:text-slate-500 ${isPrivacyMode ? 'blur-sm' : ''}`}>Meta: R$ {budget.amount.toFixed(0)}</span>
                 </div>
                 <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${statusColor}`}
                    />
                 </div>
              </div>
            </motion.div>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] text-slate-400 dark:text-slate-600">
             <Target size={48} className="mb-4 opacity-20" />
             <p>Nenhum orçamento definido.</p>
          </div>
        )}
      </div>
    </div>
  );
};

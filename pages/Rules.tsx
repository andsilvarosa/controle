
import React, { useState } from 'react';
import { Zap, ArrowRight, Trash2, Pencil, Plus, XCircle } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion } from 'framer-motion';

export const Rules: React.FC = () => {
  const { rules, categories, toggleRule, deleteRule, setActiveModal, setEditingRule } = useFinanceStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setActiveModal('rule');
  };

  const handleCreate = () => {
    setEditingRule(null);
    setActiveModal('rule');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      deleteRule(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(current => current === id ? null : current), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm font-medium">Automatize a categorização dos seus lançamentos bancários.</p>
        <button 
          onClick={handleCreate}
          className="bg-teal-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2 hover:bg-teal-600 transition-all active:scale-95"
        >
          <Zap size={18} />
          Nova Regra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => {
          const category = categories.find(c => c.id === rule.categoryId);
          const isConfirming = deleteConfirmId === rule.id;

          return (
            <motion.div 
              key={rule.id}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group transition-all relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                  <Zap size={24} />
                </div>
                {/* Toggle Switch */}
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${rule.active ? 'bg-teal-500' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ x: rule.active ? 26 : 2 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  Se descrição contém <span className="text-slate-800 font-bold px-2 py-1 bg-slate-100 rounded-lg">"{rule.condition}"</span>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight size={18} className="text-slate-300" />
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }} />
                    <span className="text-sm font-bold text-slate-700">{category?.name || 'Sem Categoria'}</span>
                  </div>
                </div>
              </div>

              <div className={`mt-8 flex justify-end gap-2 transition-opacity ${isConfirming ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {!isConfirming && (
                  <button 
                    onClick={() => handleEdit(rule)}
                    className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                )}
                
                <button 
                  onClick={(e) => handleDelete(e, rule.id)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                    isConfirming 
                      ? 'bg-red-500 text-white px-4 shadow-lg ring-2 ring-red-200' 
                      : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  {isConfirming ? (
                    <>
                      <XCircle size={18} />
                      <span className="text-xs font-bold whitespace-nowrap">Confirmar Exclusão?</span>
                    </>
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Create Card placeholder */}
        <button 
          onClick={handleCreate}
          className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-bold">Adicionar Nova Regra</span>
        </button>
      </div>
    </div>
  );
};

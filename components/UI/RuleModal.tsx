
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, ArrowRight } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Rule } from '../../types';

export const RuleModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    categories, 
    editingRule, 
    addRule, 
    updateRule,
    setEditingRule
  } = useFinanceStore();
  
  const [formData, setFormData] = useState({
    condition: '',
    categoryId: '',
    active: true
  });

  useEffect(() => {
    if (editingRule) {
      setFormData({
        condition: editingRule.condition,
        categoryId: editingRule.categoryId,
        active: editingRule.active
      });
    } else {
      setFormData({
        condition: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        active: true
      });
    }
  }, [editingRule, categories, activeModal]);

  if (activeModal !== 'rule') return null;

  const handleClose = () => {
    setActiveModal(null);
    setEditingRule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ruleData: Rule = {
      id: editingRule?.id || Date.now().toString(),
      ...formData
    };

    if (editingRule) {
      updateRule(ruleData);
    } else {
      addRule(ruleData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingRule ? 'Editar' : 'Nova'} Regra
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={24} />
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="p-6 bg-teal-50 rounded-[24px] border border-teal-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-white text-teal-600 rounded-xl shadow-sm">
                  <Zap size={20} />
                </div>
                <p className="text-sm font-bold text-teal-800 uppercase tracking-wider">Lógica da Regra</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">Se a descrição contém:</label>
                  <input 
                    required
                    value={formData.condition}
                    onChange={e => setFormData({...formData, condition: e.target.value})}
                    placeholder="Ex: Uber, Netflix, Padaria..."
                    className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center justify-center py-2 text-teal-300">
                  <ArrowRight size={24} />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">Atribuir categoria:</label>
                  <select 
                    required
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-teal-500/20 appearance-none transition-all shadow-sm"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="font-bold text-slate-700">Regra Ativa</span>
              <button 
                type="button"
                onClick={() => setFormData({...formData, active: !formData.active})}
                className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-teal-500' : 'bg-slate-300'}`}
              >
                <motion.div 
                  animate={{ x: formData.active ? 24 : 2 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </button>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-slate-800 hover:bg-slate-900 rounded-2xl font-bold text-white text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              {editingRule ? 'Salvar Alterações' : 'Criar Regra de Automação'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

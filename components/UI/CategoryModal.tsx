
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Utensils, Briefcase, Film, Heart, ShoppingBag, 
  Car, Check, Home, Plane, Coffee, GraduationCap, 
  ShieldCheck, Gift, Zap, ShoppingCart, Phone, 
  Gamepad2, Wifi, Tv, Banknote, Coins, PiggyBank, 
  HandCoins, User, Users, Baby, Stethoscope, Shirt, Armchair
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Category } from '../../types';

const icons = [
  { id: 'Banknote', icon: Banknote },
  { id: 'Coins', icon: Coins },
  { id: 'PiggyBank', icon: PiggyBank },
  { id: 'HandCoins', icon: HandCoins },
  { id: 'User', icon: User },
  { id: 'Users', icon: Users },
  { id: 'Baby', icon: Baby },
  { id: 'Stethoscope', icon: Stethoscope },
  { id: 'Shirt', icon: Shirt },
  { id: 'Armchair', icon: Armchair },
  { id: 'Utensils', icon: Utensils },
  { id: 'Briefcase', icon: Briefcase },
  { id: 'Film', icon: Film },
  { id: 'Heart', icon: Heart },
  { id: 'ShoppingBag', icon: ShoppingBag },
  { id: 'Car', icon: Car },
  { id: 'Home', icon: Home },
  { id: 'Plane', icon: Plane },
  { id: 'Coffee', icon: Coffee },
  { id: 'GraduationCap', icon: GraduationCap },
  { id: 'ShieldCheck', icon: ShieldCheck },
  { id: 'Gift', icon: Gift },
  { id: 'Zap', icon: Zap },
  { id: 'ShoppingCart', icon: ShoppingCart },
  { id: 'Phone', icon: Phone },
  { id: 'Gamepad2', icon: Gamepad2 },
  { id: 'Wifi', icon: Wifi },
  { id: 'Tv', icon: Tv },
];

const colors = [
  '#14b8a6', '#0d9488', '#0f766e', // Teals
  '#3b82f6', '#2563eb', '#1d4ed8', // Blues
  '#8b5cf6', '#7c3aed', '#6d28d9', // Violets
  '#ef4444', '#dc2626', '#b91c1c', // Reds
  '#f59e0b', '#d97706', '#b45309', // Ambers
  '#10b981', '#059669', '#047857', // Emeralds
  '#ec4899', '#db2777', '#be185d', // Pinks
  '#64748b', '#475569', '#334155', // Slates
];

export const CategoryModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    editingCategory, 
    addCategory, 
    updateCategory,
    setEditingCategory
  } = useFinanceStore();
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Utensils',
    color: '#14b8a6',
    type: 'expense' as 'income' | 'expense'
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        type: editingCategory.type
      });
    } else {
      setFormData({
        name: '',
        icon: 'Utensils',
        color: '#14b8a6',
        type: 'expense'
      });
    }
  }, [editingCategory, activeModal]);

  if (activeModal !== 'category') return null;

  const handleClose = () => {
    setActiveModal(null);
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData: Category = {
      id: editingCategory?.id || Date.now().toString(),
      ...formData
    };

    if (editingCategory) {
      updateCategory(categoryData);
    } else {
      addCategory(categoryData);
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
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative z-10 my-auto"
      >
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingCategory ? 'Editar' : 'Nova'} Categoria
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={24} />
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nome da Categoria</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Mercado, Freelance..."
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${formData.type === 'income' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Despesa
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ícone</label>
              <div className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto p-1 scrollbar-thin">
                {icons.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({...formData, icon: id})}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${formData.icon === id ? 'bg-teal-50 text-teal-600 ring-2 ring-teal-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cor da Tag</label>
              <div className="grid grid-cols-8 gap-3 max-h-[140px] overflow-y-auto p-1 scrollbar-thin">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({...formData, color})}
                    className="aspect-square rounded-full relative transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-teal-500 hover:bg-teal-600 rounded-2xl font-bold text-white text-lg shadow-xl shadow-teal-500/20 transition-all active:scale-95"
            >
              {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

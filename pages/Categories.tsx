
import React, { useState } from 'react';
import { 
  Plus, Pencil, Trash2, Utensils, Briefcase, Film, 
  Heart, ShoppingBag, Car, Home, Plane, Coffee, 
  GraduationCap, ShieldCheck, Gift, Zap, ShoppingCart, 
  Phone, Gamepad2, Wifi, Tv, XCircle, Banknote, Coins, 
  PiggyBank, HandCoins, User, Users, Baby, Stethoscope, Shirt, Armchair
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = { 
  Utensils, Briefcase, Film, Heart, ShoppingBag, 
  Car, Home, Plane, Coffee, GraduationCap, 
  ShieldCheck, Gift, Zap, ShoppingCart, Phone, 
  Gamepad2, Wifi, Tv, Banknote, Coins, PiggyBank, 
  HandCoins, User, Users, Baby, Stethoscope, Shirt, Armchair
};

export const Categories: React.FC = () => {
  const { categories, deleteCategory, setActiveModal, setEditingCategory } = useFinanceStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setActiveModal('category');
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setActiveModal('category');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      deleteCategory(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(current => current === id ? null : current), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm font-medium">Gerencie suas classificações financeiras.</p>
        <button 
          onClick={handleCreate}
          className="bg-teal-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2 hover:bg-teal-600 transition-all active:scale-95"
        >
          <Plus size={18} />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Utensils;
          const isConfirming = deleteConfirmId === cat.id;

          return (
            <motion.div 
              key={cat.id}
              whileHover={{ x: 4 }}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{cat.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${cat.type === 'income' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
                    {cat.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 transition-all duration-300 ${isConfirming ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {!isConfirming && (
                  <button 
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                
                <button 
                  onClick={(e) => handleDelete(e, cat.id)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                    isConfirming 
                      ? 'bg-red-500 text-white px-3 shadow-md ring-2 ring-red-200 z-10' 
                      : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title="Excluir"
                >
                  {isConfirming ? (
                    <>
                      <XCircle size={16} />
                      <span className="text-xs font-bold whitespace-nowrap">Confirmar?</span>
                    </>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

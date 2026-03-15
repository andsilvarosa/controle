
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Wallet as WalletIcon, Trash2, Plane, Globe2, ArrowRightLeft, Pencil, X, Check, XCircle } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Wallet, CurrencyCode } from '../types';

export const Wallets: React.FC = () => {
  const { wallets, addWallet, updateWallet, deleteWallet, isPrivacyMode, editingWallet, setEditingWallet } = useFinanceStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const defaultFormState: Partial<Wallet> = { 
    name: '', 
    type: 'checking', 
    color: '#0f172a', 
    balance: 0,
    currency: 'BRL',
    exchangeRate: 1
  };

  const [formData, setFormData] = useState<Partial<Wallet>>(defaultFormState);

  // Sincroniza o formulário quando uma carteira é selecionada para edição
  useEffect(() => {
    if (editingWallet) {
      setFormData({
        name: editingWallet.name,
        type: editingWallet.type,
        color: editingWallet.color,
        balance: editingWallet.balance,
        currency: editingWallet.currency || 'BRL',
        exchangeRate: editingWallet.exchangeRate || 1
      });
      setIsFormOpen(true);
    }
  }, [editingWallet]);

  const handleOpenCreate = () => {
    setEditingWallet(null);
    setFormData(defaultFormState);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWallet(null);
    setFormData(defaultFormState);
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    // O useEffect cuidará de abrir o formulário e preencher os dados
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      deleteWallet(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
        id: editingWallet ? editingWallet.id : Date.now().toString(),
        name: formData.name!,
        type: formData.type as any,
        color: formData.color!,
        balance: Number(formData.balance),
        currency: formData.currency,
        exchangeRate: Number(formData.exchangeRate) || 1
    };

    if (editingWallet) {
        updateWallet(payload);
    } else {
        addWallet(payload);
    }
    
    handleCloseForm();
  };

  const bgMap: Record<string, string> = {
    '#0f172a': 'bg-slate-900', '#14b8a6': 'bg-teal-600', '#3b82f6': 'bg-blue-600',
    '#8b5cf6': 'bg-violet-600', '#ef4444': 'bg-red-600', '#f59e0b': 'bg-amber-600', '#10b981': 'bg-emerald-600',
  };

  const currencySymbols: Record<CurrencyCode, string> = {
    'BRL': 'R$', 'USD': 'US$', 'EUR': '€', 'GBP': '£'
  };

  const currencyFlags: Record<CurrencyCode, string> = {
    'BRL': '🇧🇷', 'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧'
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            Minhas Carteiras
            <span className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-bold">Multi-moeda</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão de contas, cartões e moedas estrangeiras</p>
        </div>
        {!isFormOpen && (
            <button 
            onClick={handleOpenCreate} 
            className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-2.5 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-95"
            >
            <Plus size={18} /> Nova Carteira
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
            <div className="bg-white dark:bg-slate-800 p-6 lg:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl mb-8 relative">
               <button 
                 onClick={handleCloseForm}
                 className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full text-slate-400 transition-colors"
               >
                 <X size={20} />
               </button>

               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className={`p-3 rounded-2xl ${editingWallet ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                    {editingWallet ? <Pencil size={24} /> : <Globe2 size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {editingWallet ? 'Editar Carteira' : 'Criar Nova Carteira'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {editingWallet ? 'Atualize os dados da sua conta' : 'Configure contas nacionais ou internacionais'}
                    </p>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Nome da Carteira</label>
                   <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500/20" placeholder="Ex: Nubank, Dólar Cash..." />
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Tipo</label>
                   <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white appearance-none">
                     <option value="checking">Conta Corrente</option>
                     <option value="credit_card">Cartão de Crédito</option>
                     <option value="cash">Dinheiro Físico</option>
                     <option value="investment">Investimento</option>
                     <option value="travel">Viagem (Travel Money)</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Moeda</label>
                   <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as CurrencyCode})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white appearance-none">
                     <option value="BRL">🇧🇷 Real (BRL)</option>
                     <option value="USD">🇺🇸 Dólar (USD)</option>
                     <option value="EUR">🇪🇺 Euro (EUR)</option>
                     <option value="GBP">🇬🇧 Libra (GBP)</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                        Saldo Atual ({formData.currency})
                    </label>
                    <input 
                        type="number" 
                        step="0.01" 
                        value={formData.balance} 
                        onChange={e => setFormData({...formData, balance: parseFloat(e.target.value)})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white"
                    />
                 </div>

                 {formData.currency !== 'BRL' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                        <ArrowRightLeft size={12} /> Câmbio (1 {formData.currency} = X BRL)
                      </label>
                      <input 
                        type="number" 
                        step="0.0001" 
                        value={formData.exchangeRate} 
                        onChange={e => setFormData({...formData, exchangeRate: parseFloat(e.target.value)})} 
                        className="w-full px-4 py-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl font-bold text-teal-700 dark:text-teal-300" 
                      />
                    </div>
                 )}
                 
                 <div className="space-y-2 lg:col-span-2">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Cor do Cartão</label>
                   <div className="flex gap-2">
                     {['#0f172a', '#3b82f6', '#8b5cf6', '#14b8a6', '#ef4444', '#10b981'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({...formData, color: c})}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c ? 'border-slate-400 scale-110 shadow-md ring-2 ring-slate-200' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                     ))}
                   </div>
                 </div>

                 <div className="lg:col-span-2 flex gap-3">
                     <button type="button" onClick={handleCloseForm} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        Cancelar
                     </button>
                     <button type="submit" className="flex-1 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold shadow-lg hover:scale-[1.01] transition-transform">
                        {editingWallet ? 'Salvar Alterações' : 'Criar Carteira'}
                     </button>
                 </div>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {wallets.map((wallet) => {
            const isForeign = wallet.currency && wallet.currency !== 'BRL';
            const convertedBalance = (wallet.balance * (wallet.exchangeRate || 1));
            const isConfirming = deleteConfirmId === wallet.id;

            return (
              <motion.div 
                key={wallet.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }} 
                className={`relative h-64 rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between overflow-hidden group transition-all duration-300 ${bgMap[wallet.color] || 'bg-slate-900'}`}
              >
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
                
                {/* Header do Card */}
                <div className="relative z-10 flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest px-2 py-0.5 bg-black/20 rounded-lg backdrop-blur-md">
                          {wallet.type === 'credit_card' ? 'Cartão' : wallet.type === 'travel' ? 'Travel Money' : 'Conta'}
                        </span>
                        {isForeign && (
                           <span className="text-[10px] font-bold opacity-100 uppercase tracking-widest px-2 py-0.5 bg-white/20 text-white rounded-lg backdrop-blur-md flex items-center gap-1">
                             <Plane size={10} /> Modo Viagem
                           </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight truncate max-w-[200px]">{wallet.name}</h3>
                   </div>
                   <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                     {wallet.type === 'credit_card' ? <CreditCard size={24} /> : wallet.type === 'travel' ? <Globe2 size={24} /> : <WalletIcon size={24} />}
                   </div>
                </div>

                {/* Saldo */}
                <div className="relative z-10 space-y-1">
                   <p className="text-xs font-bold opacity-70">Saldo Disponível</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-lg font-medium opacity-80">{currencySymbols[wallet.currency || 'BRL']}</span>
                     <p className={`text-4xl font-black tracking-tight ${isPrivacyMode ? 'blur-md' : ''}`}>
                       {wallet.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </p>
                   </div>
                   
                   {isForeign && (
                     <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                        <span className="text-xs opacity-60">≈ R$ {convertedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="text-[10px] opacity-40 bg-black/20 px-1.5 py-0.5 rounded">Taxa: {wallet.exchangeRate}</span>
                     </div>
                   )}
                </div>

                {/* Footer do Card - Actions - Z-Index 20 para garantir clique */}
                <div className={`absolute bottom-6 right-8 flex items-center gap-2 transition-opacity z-20 ${isConfirming ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                   {!isConfirming && (
                       <button 
                         onClick={() => handleEdit(wallet)} 
                         className="p-3 bg-white/20 hover:bg-white hover:text-slate-900 text-white rounded-full shadow-lg transition-colors backdrop-blur-md"
                         title="Editar Carteira"
                       >
                         <Pencil size={18} />
                       </button>
                   )}
                   
                   <button 
                     onClick={(e) => handleDelete(e, wallet.id)} 
                     className={`p-3 rounded-full shadow-lg transition-all flex items-center gap-2 ${
                        isConfirming 
                         ? 'bg-red-500 hover:bg-red-600 text-white w-auto px-4' 
                         : 'bg-white/20 hover:bg-red-500 hover:text-white text-white'
                     }`}
                     title="Excluir Carteira"
                   >
                     {isConfirming ? (
                        <>
                            <XCircle size={18} />
                            <span className="text-xs font-bold">Confirmar?</span>
                        </>
                     ) : (
                        <Trash2 size={18} />
                     )}
                   </button>
                </div>
                
                {/* Bandeira de Fundo Decorativa */}
                {isForeign && (
                   <div className="absolute -bottom-4 -right-4 text-9xl opacity-10 pointer-events-none grayscale select-none z-0">
                      {currencyFlags[wallet.currency || 'BRL']}
                   </div>
                )}
              </motion.div>
            );
        })}
      </div>
    </div>
  );
};

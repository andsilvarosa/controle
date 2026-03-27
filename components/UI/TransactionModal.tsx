
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Repeat, Hash, Tag, CheckCircle2, CreditCard, AlignLeft, Info, Sparkles, Wand2, ArrowDown } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Transaction, RecurrencePeriod } from '../../types';

export const TransactionModal: React.FC = () => {
  const { 
      activeModal, 
      setActiveModal, 
      categories, 
      wallets, 
      editingTransaction, 
      addTransaction, 
      updateTransaction,
      setRecurrencePendingAction,
      pendingBankTransaction,
      setPendingBankTransaction
  } = useFinanceStore();

  const getTodayStr = () => new Date().toLocaleDateString('sv-SE');
  
  const [entryMode, setEntryMode] = useState<'manual' | 'smart'>('manual');
  const [smartInput, setSmartInput] = useState('');

  const [formData, setFormData] = useState({
    description: '', amount: '0,00', date: getTodayStr(), dueDate: getTodayStr(),
    categoryId: '', walletId: '', isPaid: false, notes: '', recurrence: 'none' as RecurrencePeriod, installments: '1'
  });

  const formatAmount = (val: string) => {
    const cleanValue = val.replace(/\D/g, "");
    if (!cleanValue) return "0,00";
    return (parseInt(cleanValue, 10) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseAmount = (val: string) => parseInt(val.replace(/\D/g, ""), 10) / 100;
  const toInputDate = (isoString?: string) => isoString ? isoString.split('T')[0] : getTodayStr();

  useEffect(() => {
    if (editingTransaction) {
      setEntryMode('manual'); 
      setFormData({
        description: editingTransaction.description,
        amount: editingTransaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        date: toInputDate(editingTransaction.date),
        dueDate: toInputDate(editingTransaction.dueDate),
        categoryId: editingTransaction.categoryId,
        walletId: editingTransaction.walletId || (wallets[0]?.id || ''),
        isPaid: editingTransaction.isPaid,
        notes: editingTransaction.notes || '',
        recurrence: editingTransaction.recurrence || 'none',
        installments: (editingTransaction.installments || 1).toString()
      });
    } else if (pendingBankTransaction) {
      setEntryMode('manual');
      setFormData({
        description: pendingBankTransaction.description || '',
        amount: pendingBankTransaction.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00',
        date: getTodayStr(),
        dueDate: getTodayStr(),
        categoryId: categories[0]?.id || '',
        walletId: wallets[0]?.id || '',
        isPaid: true, // Geralmente notificação de banco já está paga
        notes: pendingBankTransaction.notes || '',
        recurrence: 'none',
        installments: '1'
      });
      setSmartInput('');
    } else {
      setFormData({
        description: '', amount: '0,00', date: getTodayStr(), dueDate: getTodayStr(),
        categoryId: categories[0]?.id || '', walletId: wallets[0]?.id || '', isPaid: false,
        notes: '', recurrence: 'none', installments: '1'
      });
      setSmartInput('');
    }
  }, [editingTransaction, categories, wallets, activeModal]);

  if (activeModal !== 'income' && activeModal !== 'expense') return null;
  
  const handleCloseModal = () => {
    setActiveModal(null);
    setPendingBankTransaction(null);
  };

  const isIncome = activeModal === 'income';
  const theme = isIncome ? 'teal' : 'red';
  const themeColor = isIncome ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400';
  const themeBg = isIncome ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-red-50 dark:bg-red-900/20';
  const themeBorder = isIncome ? 'border-teal-100 dark:border-teal-800' : 'border-red-100 dark:border-red-800';

  const handleSmartProcess = () => {
    const text = smartInput.toLowerCase();
    const amountMatch = text.match(/\d+([.,]\d{1,2})?/);
    let newAmount = '0,00';
    if (amountMatch) {
       let raw = amountMatch[0].replace(',', '.');
       if (!raw.includes('.')) raw += '.00';
       const floatVal = parseFloat(raw);
       newAmount = floatVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    let foundCat = categories[0]?.id || '';
    for (const cat of categories) {
      if (text.includes(cat.name.toLowerCase())) {
        foundCat = cat.id;
        break;
      }
    }

    let cleanDesc = smartInput;
    if (amountMatch) cleanDesc = cleanDesc.replace(amountMatch[0], '').trim();
    cleanDesc = cleanDesc.replace(/\b(no|na|em|de|com|para)\b/g, '').replace(/\s+/g, ' ').trim();
    if (!cleanDesc) cleanDesc = "Nova Transação";

    setFormData(prev => ({
      ...prev,
      amount: newAmount,
      categoryId: foundCat,
      description: cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1)
    }));
    setEntryMode('manual');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tData: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      description: formData.description,
      amount: parseAmount(formData.amount),
      date: formData.date, dueDate: formData.dueDate,
      categoryId: formData.categoryId, walletId: formData.walletId,
      type: activeModal, isPaid: formData.isPaid, notes: formData.notes,
      recurrence: formData.recurrence,
      installments: (formData.recurrence !== 'fixed' && formData.recurrence !== 'none') ? parseInt(formData.installments) || 1 : 1,
      isVirtual: editingTransaction?.isVirtual,
      masterId: editingTransaction?.masterId
    };

    if (editingTransaction) {
       // Check if recurring or virtual
       if (editingTransaction.isRecurring || editingTransaction.isVirtual) {
          setRecurrencePendingAction({
              type: 'edit',
              transaction: editingTransaction,
              newTransactionData: tData
          });
          setActiveModal('recurrence-action');
       } else {
          updateTransaction(tData);
       }
    } else {
       addTransaction(tData);
    }
  };

  const isVirtualView = editingTransaction?.isVirtual;
  const installmentInfo = editingTransaction?.currentInstallment 
    ? ` • ${editingTransaction.currentInstallment}/${editingTransaction.installments}` 
    : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center lg:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-slate-900 w-full lg:max-w-lg rounded-t-[32px] lg:rounded-[32px] shadow-2xl overflow-hidden relative z-10 max-h-[95vh] lg:max-h-[90vh] flex flex-col"
      >
        <div className="w-full flex justify-center pt-3 pb-1 lg:hidden" onClick={handleCloseModal}>
           <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {editingTransaction ? (isVirtualView ? 'Pagar/Efetivar' : 'Editar') : 'Nova'} <span className={themeColor}>{isIncome ? 'Receita' : 'Despesa'}</span>
            </h2>
            <button onClick={handleCloseModal} className="hidden lg:block p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
          </div>
          
          {!editingTransaction && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
               <button 
                 onClick={() => setEntryMode('manual')}
                 className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${entryMode === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}
               >
                 Manual
               </button>
               <button 
                 onClick={() => setEntryMode('smart')}
                 className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${entryMode === 'smart' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md' : 'text-slate-500'}`}
               >
                 <Sparkles size={14} /> Smart AI
               </button>
            </div>
          )}

          {entryMode === 'smart' ? (
             <div className="space-y-4 py-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900 dark:to-fuchsia-900 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-600 dark:text-violet-300">
                   <Sparkles size={32} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Digite como você fala</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm px-8">Ex: "Mercado 250 reais", "Gasolina 50", "Salário 3000".</p>
                
                <div className="relative mt-4">
                  <textarea 
                    autoFocus
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    placeholder="Descreva sua transação..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-violet-400 rounded-2xl h-32 resize-none focus:ring-0 text-lg font-medium text-slate-700 dark:text-white"
                  />
                  <button 
                    disabled={!smartInput.trim()}
                    onClick={handleSmartProcess}
                    className="absolute bottom-4 right-4 bg-slate-800 dark:bg-slate-700 text-white p-2 rounded-xl hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
                  >
                    <Wand2 size={20} />
                  </button>
                </div>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {isVirtualView && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Info size={16} />
                    <span>Esta é a parcela <b>{installmentInfo.replace(' • ', '')}</b> projetada. Ao salvar, você confirma o lançamento.</span>
                </div>
              )}

              <div className={`p-6 rounded-[24px] text-center ${themeBg} border ${themeBorder}`}>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Valor {formData.recurrence === 'monthly' ? 'da Parcela' : ''}</label>
                  <div className="relative inline-flex items-center justify-center">
                    <span className={`text-2xl font-bold ${themeColor} opacity-60 mr-1`}>R$</span>
                    <input required inputMode="numeric" value={formData.amount} onChange={e => setFormData({...formData, amount: formatAmount(e.target.value)})} className={`bg-transparent border-none text-center text-4xl font-black focus:ring-0 p-0 w-48 ${themeColor}`} placeholder="0,00" />
                  </div>
              </div>

              <div className="relative group">
                <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descrição" className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-teal-500/20 text-slate-700 dark:text-white font-bold placeholder:font-normal" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none">
                      <option value="" disabled>Categoria</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select value={formData.walletId} onChange={e => setFormData({...formData, walletId: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none">
                      <option value="" disabled>Carteira</option>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Vencimento</label>
                    <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 text-sm focus:ring-2 focus:ring-teal-500/20 dark:[color-scheme:dark]" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Competência</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-medium text-slate-500 dark:text-slate-400 text-sm dark:[color-scheme:dark]" />
                </div>
              </div>

              <div onClick={() => setFormData({...formData, isPaid: !formData.isPaid})} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${formData.isPaid ? (isIncome ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800') : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${formData.isPaid ? (isIncome ? 'bg-teal-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}><CheckCircle2 size={18} /></div>
                    <span className={`font-bold text-sm ${formData.isPaid ? (isIncome ? 'text-teal-700 dark:text-teal-400' : 'text-red-700 dark:text-red-400') : 'text-slate-500 dark:text-slate-400'}`}>{formData.isPaid ? (isIncome ? 'Recebido' : 'Pago') : 'Pendente'}</span>
                  </div>
              </div>

              {!isVirtualView && !editingTransaction && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recorrência / Parcelamento</label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex gap-3">
                        <select value={formData.recurrence} onChange={e => setFormData({...formData, recurrence: e.target.value as RecurrencePeriod})} className="flex-1 bg-white dark:bg-slate-700 border-none rounded-xl text-sm font-bold text-slate-600 dark:text-white py-2 pl-3">
                          <option value="none">Único</option>
                          <option value="fixed">Fixo (Assinatura/Conta)</option>
                          <option value="monthly">Parcelado (x Vezes)</option>
                          <option value="weekly">Semanal</option>
                          <option value="annual">Anual</option>
                        </select>
                        {formData.recurrence === 'monthly' && (
                          <div className="flex items-center bg-white dark:bg-slate-700 rounded-xl px-3 border border-slate-100 dark:border-slate-600">
                              <span className="text-xs font-bold text-slate-400 mr-2">x</span>
                              <input type="number" min="2" max="60" value={formData.installments} onChange={e => setFormData({...formData, installments: e.target.value})} className="w-12 bg-transparent border-none p-0 font-bold text-sm text-center text-slate-800 dark:text-white" placeholder="12" />
                          </div>
                        )}
                    </div>
                </div>
              )}

              <button type="submit" className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all ${isIncome ? 'bg-teal-500 shadow-teal-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                {editingTransaction ? (isVirtualView ? 'Confirmar Lançamento' : 'Salvar') : 'Adicionar'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

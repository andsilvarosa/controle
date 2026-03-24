import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Transaction } from '../types';

interface AutoTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankName: string;
  amount: number;
  type: 'expense' | 'income';
}

export function AutoTransactionModal({ isOpen, onClose, bankName, amount, type }: AutoTransactionModalProps) {
  const { categories, addTransaction, addWalletAsync, findWalletByName, wallets } = useFinanceStore();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Pegar qualquer categoria padrão
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let walletId = '';
      const existingWallet = findWalletByName(bankName);
      
      if (existingWallet) {
         walletId = existingWallet.id;
      } else {
         walletId = await addWalletAsync({
           id: crypto.randomUUID(),
           name: bankName,
           balance: 0,
           color: '#3498db',
           excludeFromTotal: false,
           type: 'checking'
         });
      }

      const today = new Date().toISOString().split('T')[0];
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        description: `Lançamento automático: ${bankName}`,
        amount: amount,
        type: type,
        categoryId: selectedCategory,
        walletId,
        date: today,
        dueDate: today,
        isPaid: true,
        isRecurring: false,
        recurrence: 'none'
      };

      await addTransaction(newTransaction);
      onClose();
    } catch (e) {
       console.error(e);
       alert("Erro ao salvar transação automática.");
    } finally {
       setIsSaving(false);
    }
  };

  const isWalletMissing = !findWalletByName(bankName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
         <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Novo Lançamento Detectado</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Capturamos uma notificação de transação no banco <strong>{bankName}</strong>.
            </p>

            <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-gray-500">Valor</span>
                 <span className={`text-lg font-bold ${type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                   {type === 'expense' ? '-' : '+'}
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Banco</span>
                 <span className="font-medium">{bankName}</span>
               </div>
            </div>

            {isWalletMissing ? (
               <div className="text-amber-500 text-sm mb-4">
                 ⚠️ Não encontramos a carteira <strong>{bankName}</strong>. Ela será criada automaticamente caso você continue.
               </div>
            ) : null}

            <select 
               className="w-full mb-6 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent"
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
            >
               {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>

            <div className="flex gap-3">
               <button 
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
               >
                 Ignorar
               </button>
               <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
               >
                 {isSaving ? 'Salvando...' : 'Adicionar'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

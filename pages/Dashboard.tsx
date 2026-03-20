
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Search, Inbox, Pencil, Trash2, 
  CheckCircle2, HelpCircle, XCircle, ChevronLeft, ChevronRight, Activity,
  Utensils, Briefcase, Film, Heart, ShoppingBag, Car, Home, Plane, Coffee, 
  GraduationCap, ShieldCheck, Gift, Zap, ShoppingCart, Phone, Gamepad2, Wifi, Tv,
  Banknote, Coins, PiggyBank, HandCoins, User, Users, Baby, Stethoscope, Shirt, Armchair,
  CreditCard, ArrowUpRight, ArrowDownRight, CalendarRange, AlertTriangle, Droplets,
  EyeOff, Shield
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Transaction } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSkeleton } from '../components/UI/Skeleton';

const iconMap: Record<string, any> = { 
  Utensils, Briefcase, Film, Heart, ShoppingBag, Car, Home, Plane, Coffee, 
  GraduationCap, ShieldCheck, Gift, Zap, ShoppingCart, Phone, Gamepad2, Wifi, Tv,
  Banknote, Coins, PiggyBank, HandCoins, User, Users, Baby, Stethoscope, Shirt, Armchair
};

const getRelativeDateLabel = (dateString: string) => {
    const cleanDate = dateString.trim();
    if (!cleanDate) return 'Data Inválida';
    
    const date = new Date(cleanDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const compareDate = new Date(date);
    compareDate.setHours(0,0,0,0);
    
    const dTime = compareDate.getTime();
    if (dTime === today.getTime()) return 'Hoje';
    if (dTime === yesterday.getTime()) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
};

// --- HORIZONTE FINANCEIRO ---
const FinancialHorizon: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const projections = useMemo(() => {
    const today = new Date();
    const futureMonths = [];

    // Projetar próximos 6 meses
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthKey = targetDate.getMonth();
      const yearKey = targetDate.getFullYear();
      
      const monthTransactions = transactions.filter(t => {
         const tDate = new Date(t.dueDate + 'T00:00:00');
         return tDate.getMonth() === monthKey && tDate.getFullYear() === yearKey;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      const liquid = income - expense;
      // Nível de comprometimento da renda (0 a 100%)
      const commitment = income > 0 ? (expense / income) * 100 : expense > 0 ? 100 : 0;

      let status: 'healthy' | 'warning' | 'danger' = 'healthy';
      if (commitment > 90 || liquid < 0) status = 'danger';
      else if (commitment > 70) status = 'warning';

      futureMonths.push({
        date: targetDate,
        label: i === 0 ? 'Este Mês' : targetDate.toLocaleDateString('pt-BR', { month: 'long' }),
        year: targetDate.getFullYear(),
        income,
        expense,
        liquid,
        commitment,
        status
      });
    }
    return futureMonths;
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-brand-dark dark:text-white flex items-center gap-3">
          <div className="p-2 bg-brand-green/10 rounded-xl">
            <CalendarRange size={24} className="text-brand-green" />
          </div>
          Horizonte Financeiro
        </h2>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projeção 6 Meses</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory custom-scrollbar">
        {projections.map((month, idx) => {
          const isDanger = month.status === 'danger';
          const isWarning = month.status === 'warning';
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`snap-center flex-shrink-0 w-72 p-6 rounded-4xl border transition-all relative overflow-hidden group ${
                isDanger 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' 
                  : isWarning
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'
                    : 'bg-white dark:bg-brand-dark border-brand-gray/20 dark:border-brand-dark/50'
              }`}
            >
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40 dark:text-brand-gray/40 mb-0.5">
                    {month.label}
                  </p>
                  <p className="text-[10px] font-bold text-brand-dark/20 dark:text-brand-gray/20">
                    {month.year}
                  </p>
                </div>
                <div className={`p-2.5 rounded-2xl ${
                   isDanger ? 'bg-red-100 text-red-600' : isWarning ? 'bg-orange-100 text-orange-600' : 'bg-brand-green/10 text-brand-green'
                }`}>
                   {isDanger ? <AlertTriangle size={18} /> : isWarning ? <Activity size={18} /> : <Droplets size={18} />}
                </div>
              </div>

              {/* Valor Liquido Principal */}
              <div className="mb-6 relative z-10">
                 <p className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-wider mb-1">Sobra Projetada</p>
                 <h3 className={`text-2xl font-black tracking-tight ${
                    month.liquid < 0 ? 'text-red-500' : 'text-brand-dark dark:text-white'
                 }`}>
                    {month.liquid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </h3>
              </div>

              {/* Barra de Progresso / Comprometimento */}
              <div className="space-y-2 relative z-10">
                 <div className="flex justify-between text-[10px] font-black text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-tighter">
                    <span>Entradas: {month.income.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}</span>
                    <span>Saídas: {month.expense.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 <div className="h-2.5 w-full bg-brand-gray dark:bg-brand-dark/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(month.commitment, 100)}%` }}
                      className={`h-full rounded-full ${
                        isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-brand-green'
                      }`}
                    />
                 </div>
                 <p className={`text-[10px] text-right font-black mt-1 uppercase tracking-widest ${
                    isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-brand-green'
                 }`}>
                    {month.commitment.toFixed(0)}% Comprometido
                 </p>
              </div>
              
              {/* Efeito de Fundo Decorativo */}
              <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none ${
                 isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-brand-green'
              }`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ModernKPI: React.FC<{ label: string, value: string, type: 'income' | 'expense' | 'balance', isBlurred: boolean }> = ({ label, value, type, isBlurred }) => {
    const isBalance = type === 'balance';
    return (
        <div className={`p-6 rounded-4xl border transition-all duration-300 ${
            isBalance 
            ? 'bg-brand-dark dark:bg-black text-white border-brand-dark shadow-xl' 
            : 'bg-white dark:bg-brand-dark/80 backdrop-blur-sm border-brand-gray/20 dark:border-brand-dark shadow-sm'
        }`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-2xl ${
                    isBalance ? 'bg-brand-green text-white' : 
                    type === 'income' ? 'bg-brand-green/10 text-brand-green' : 
                    'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                    {isBalance ? <Wallet size={20} /> : type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${isBalance ? 'text-brand-gray/60' : 'text-brand-dark/50 dark:text-brand-gray/50'}`}>{label}</span>
            </div>
            <h3 className={`text-2xl lg:text-3xl font-black tracking-tight ${isBalance ? 'text-white' : 'text-brand-dark dark:text-white'} ${isBlurred ? 'blur-md select-none' : ''}`}>
                {value}
            </h3>
        </div>
    );
};

export const Dashboard: React.FC = () => {
  const { 
      transactions, categories, wallets, 
      setEditingTransaction, setActiveModal, 
      deleteTransaction, updateTransaction, 
      isPrivacyMode, isLoading, 
      setRecurrencePendingAction 
  } = useFinanceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [confirmActionId, setConfirmActionId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Uso de Objeto Date para garantir parsing correto independente do formato da string (YYYY-MM-DD vs YYYY/MM/DD)
      // Adicionamos T00:00:00 para garantir que o dia não volte por causa de UTC
      const dateStr = t.dueDate ? t.dueDate.trim() : '';
      if (!dateStr) return false;

      const tDate = new Date(dateStr + 'T00:00:00');
      
      const matchesMonth = tDate.getMonth() === selectedMonth;
      const matchesYear = tDate.getFullYear() === selectedYear;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
      
      return matchesMonth && matchesYear && matchesSearch && matchesCategory;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // Ordenação Ascendente (1 -> 31)
  }, [transactions, searchTerm, filterCategory, selectedMonth, selectedYear]);

  const groupedTransactions = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};
      filteredTransactions.forEach(t => {
          const dateKey = t.dueDate.trim(); // Garante chave limpa
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(t);
      });
      return groups;
  }, [filteredTransactions]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income' && t.isPaid)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense' && t.isPaid)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleEdit = (t: Transaction) => { setEditingTransaction(t); setActiveModal(t.type); };
  
  const handleStatusToggle = (e: React.MouseEvent, t: Transaction) => {
    e.stopPropagation();
    if (confirmActionId === t.id) { 
      if (t.isVirtual || t.isRecurring) {
        setRecurrencePendingAction({ 
          type: 'edit', 
          transaction: t, 
          newTransactionData: { ...t, isPaid: !t.isPaid } 
        });
        setActiveModal('recurrence-action');
      } else {
        updateTransaction({ ...t, isPaid: !t.isPaid }); 
      }
      setConfirmActionId(null); 
    } 
    else { setConfirmActionId(t.id); setTimeout(() => setConfirmActionId(null), 3000); }
  };
  
  const handleDelete = (e: React.MouseEvent, t: Transaction) => {
    e.stopPropagation();
    if (deleteConfirmId === t.id) {
       if (t.isRecurring || t.isVirtual) {
          setRecurrencePendingAction({ type: 'delete', transaction: t });
          setActiveModal('recurrence-action');
       } else {
          deleteTransaction(t.id);
       }
       setDeleteConfirmId(null);
    } else {
       setDeleteConfirmId(t.id);
       setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };
  
  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth > 11) { newMonth = 0; newYear++; } 
    else if (newMonth < 0) { newMonth = 11; newYear--; }
    setSelectedMonth(newMonth); setSelectedYear(newYear);
  };

  if (isLoading && transactions.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-24 lg:pb-12">
      
      {/* KPIs Principais (Hero Section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModernKPI label="Receitas" value={formatCurrency(stats.income)} type="income" isBlurred={isPrivacyMode} />
          <ModernKPI label="Despesas" value={formatCurrency(stats.expense)} type="expense" isBlurred={isPrivacyMode} />
          <ModernKPI label="Balanço Líquido" value={formatCurrency(stats.balance)} type="balance" isBlurred={isPrivacyMode} />
      </div>

      {/* HORIZONTE FINANCEIRO */}
      <FinancialHorizon transactions={transactions} />

      {/* FILTROS E PESQUISA */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl p-3 rounded-4xl border border-brand-gray/20 dark:border-brand-dark shadow-sm sticky top-[88px] z-30 transition-colors">
          <div className="flex items-center gap-2 w-full xl:w-auto">
             <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-brand-gray dark:hover:bg-brand-dark/50 rounded-2xl text-brand-dark/60 dark:text-brand-gray/60 transition-colors"><ChevronLeft size={20} /></button>
             <div className="px-4 font-bold text-brand-dark dark:text-brand-gray min-w-[160px] text-center text-lg">{months[selectedMonth]} {selectedYear}</div>
             <button onClick={() => changeMonth(1)} className="p-3 hover:bg-brand-gray dark:hover:bg-brand-dark/50 rounded-2xl text-brand-dark/60 dark:text-brand-gray/60 transition-colors"><ChevronRight size={20} /></button>
          </div>

          <div className="flex flex-1 gap-3 w-full xl:w-auto px-2">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30 dark:text-brand-gray/30 group-focus-within:text-brand-green transition-colors" size={20} />
                 <input 
                    type="text" 
                    placeholder="Buscar transação..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-brand-gray/50 dark:bg-brand-dark/50 border border-transparent focus:border-brand-green/30 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-green/5 transition-all text-brand-dark dark:text-brand-gray placeholder:text-brand-dark/30 dark:placeholder:text-brand-gray/30"
                 />
              </div>
              <select 
                 value={filterCategory}
                 onChange={(e) => setFilterCategory(e.target.value)}
                 className="bg-brand-gray/50 dark:bg-brand-dark/50 border border-transparent focus:border-brand-green/30 text-brand-dark dark:text-brand-gray text-sm rounded-3xl px-6 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-brand-green/5 cursor-pointer appearance-none"
              >
                  <option value="all">Todas Categorias</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
          </div>
      </div>

      {/* LISTA DE TRANSAÇÕES */}
      <div className="space-y-6">
          {Object.keys(groupedTransactions).length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-60">
                  <Inbox size={48} className="mb-4 stroke-1" />
                  <p>Sem lançamentos neste período.</p>
              </div>
          ) : (
              Object.entries(groupedTransactions).map(([dateKey, groupT]: [string, Transaction[]]) => (
                  <div key={dateKey} className="space-y-3">
                      <div className="sticky top-[160px] z-20 bg-[#f8fafc]/90 dark:bg-[#020617]/90 backdrop-blur-sm py-2 px-1 w-fit rounded-lg">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{getRelativeDateLabel(dateKey)}</h4>
                      </div>
                      
                      <div className="grid gap-3">
                        <AnimatePresence>
                          {groupT.map((t) => {
                             const category = categories.find(c => c.id === t.categoryId);
                             const Icon = category && iconMap[category.icon] ? iconMap[category.icon] : Utensils;
                             const isConfirming = deleteConfirmId === t.id;
                             
                             return (
                               <motion.div 
                                 key={t.id}
                                 layout
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.95 }}
                                 onClick={() => handleEdit(t)}
                                 className="bg-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/10 dark:border-brand-dark/50 hover:border-brand-green/30 dark:hover:border-brand-green/30 shadow-sm flex items-center justify-between group cursor-pointer transition-all hover:shadow-md"
                               >
                                  <div className="flex items-center gap-4">
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${t.isPaid ? (t.type === 'income' ? 'bg-brand-green/10 text-brand-green' : 'bg-red-50 dark:bg-red-900/20 text-red-600') : 'bg-brand-gray dark:bg-brand-dark/50 text-brand-dark/30 dark:text-brand-gray/30'}`}>
                                          <Icon size={24} />
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                            <h4 className={`font-bold text-lg text-brand-dark dark:text-brand-gray ${t.isPaid ? '' : 'opacity-60'}`}>{t.description}</h4>
                                            {t.isVirtual && <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Recorrente</span>}
                                            {t.installments && t.installments > 1 && (
                                               <span className="text-[10px] bg-brand-gray dark:bg-brand-dark/50 text-brand-dark/50 dark:text-brand-gray/50 px-2 py-0.5 rounded-full font-black">
                                                  {t.currentInstallment}/{t.installments}
                                               </span>
                                            )}
                                          </div>
                                          <p className="text-sm font-bold text-brand-dark/40 dark:text-brand-gray/40">{category?.name || 'Sem Categoria'} • {wallets.find(w => w.id === t.walletId)?.name}</p>
                                      </div>
                                  </div>

                                  <div className="flex items-center gap-6">
                                      <span className={`font-black text-xl ${t.type === 'income' ? 'text-brand-green' : 'text-brand-dark dark:text-brand-gray'} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                                         {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                      </span>

                                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                             onClick={(e) => handleStatusToggle(e, t)}
                                             className={`p-2.5 rounded-xl transition-all ${confirmActionId === t.id ? 'bg-orange-100 text-orange-600' : (t.isPaid ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-gray dark:bg-brand-dark/50 text-brand-dark/40 hover:text-brand-green')}`}
                                             title={t.isPaid ? "Marcar como pendente" : "Marcar como pago"}
                                          >
                                              {confirmActionId === t.id ? <HelpCircle size={20} /> : <CheckCircle2 size={20} />}
                                          </button>
                                          <button 
                                             onClick={(e) => handleDelete(e, t)}
                                             className={`p-2.5 rounded-xl transition-all ${isConfirming ? 'bg-red-500 text-white shadow-lg scale-110' : 'text-brand-dark/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                             title="Excluir"
                                          >
                                              {isConfirming ? <XCircle size={20} /> : <Trash2 size={20} />}
                                          </button>
                                      </div>
                                  </div>
                               </motion.div>
                             );
                          })}
                        </AnimatePresence>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

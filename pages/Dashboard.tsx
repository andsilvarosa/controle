
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Search, Inbox, Pencil, Trash2, 
  CheckCircle2, HelpCircle, XCircle, ChevronLeft, ChevronRight, Activity,
  Utensils, Briefcase, Film, Heart, ShoppingBag, Car, Home, Plane, Coffee, 
  GraduationCap, ShieldCheck, Gift, Zap, ShoppingCart, Phone, Gamepad2, Wifi, Tv,
  Banknote, Coins, PiggyBank, HandCoins, User, Users, Baby, Stethoscope, Shirt, Armchair,
  CreditCard, ArrowUpRight, ArrowDownRight, CalendarRange, AlertTriangle, Droplets
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
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CalendarRange size={20} className="text-indigo-500" />
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
              className={`snap-center flex-shrink-0 w-72 p-5 rounded-[28px] border transition-all relative overflow-hidden group ${
                isDanger 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' 
                  : isWarning
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              }`}
            >
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                    {month.label}
                  </p>
                  <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600">
                    {month.year}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${
                   isDanger ? 'bg-red-100 text-red-600' : isWarning ? 'bg-orange-100 text-orange-600' : 'bg-teal-50 text-teal-600'
                }`}>
                   {isDanger ? <AlertTriangle size={16} /> : isWarning ? <Activity size={16} /> : <Droplets size={16} />}
                </div>
              </div>

              {/* Valor Liquido Principal */}
              <div className="mb-6 relative z-10">
                 <p className="text-[10px] font-bold text-slate-400 mb-1">Sobra Líquida Projetada</p>
                 <h3 className={`text-2xl font-black tracking-tight ${
                    month.liquid < 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'
                 }`}>
                    {month.liquid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </h3>
              </div>

              {/* Barra de Progresso / Comprometimento */}
              <div className="space-y-1.5 relative z-10">
                 <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Entradas: {month.income.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}</span>
                    <span>Saídas: {month.expense.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(month.commitment, 100)}%` }}
                      className={`h-full rounded-full ${
                        isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-teal-500'
                      }`}
                    />
                 </div>
                 <p className={`text-[9px] text-right font-bold mt-1 ${
                    isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-teal-500'
                 }`}>
                    {month.commitment.toFixed(0)}% Comprometido
                 </p>
              </div>
              
              {/* Efeito de Fundo Decorativo */}
              <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-2xl opacity-10 pointer-events-none ${
                 isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-teal-500'
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
        <div className={`p-6 rounded-[24px] border transition-all duration-300 ${
            isBalance 
            ? 'bg-[#0f172a] dark:bg-[#1e293b] text-white border-slate-800 dark:border-slate-700 shadow-xl' 
            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/50 dark:border-slate-700 shadow-sm'
        }`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${
                    isBalance ? 'bg-slate-800 dark:bg-slate-700 text-teal-400' : 
                    type === 'income' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 
                    'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                    {isBalance ? <Wallet size={18} /> : type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isBalance ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
            </div>
            <h3 className={`text-2xl lg:text-3xl font-black tracking-tight ${isBalance ? 'text-white' : 'text-slate-800 dark:text-white'} ${isBlurred ? 'blur-md select-none' : ''}`}>
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
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-2 rounded-[24px] border border-white/40 dark:border-slate-700 shadow-sm sticky top-[88px] z-30 transition-colors">
          <div className="flex items-center gap-2 w-full xl:w-auto">
             <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-colors shadow-sm"><ChevronLeft size={18} /></button>
             <div className="px-4 font-bold text-slate-700 dark:text-slate-200 min-w-[140px] text-center">{months[selectedMonth]} {selectedYear}</div>
             <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-colors shadow-sm"><ChevronRight size={18} /></button>
          </div>

          <div className="flex flex-1 gap-3 w-full xl:w-auto px-2">
              <div className="relative flex-1 group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                 <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-transparent focus:border-teal-200 dark:focus:border-teal-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all shadow-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                 />
              </div>
              <select 
                 value={filterCategory}
                 onChange={(e) => setFilterCategory(e.target.value)}
                 className="bg-white dark:bg-slate-700 border border-transparent focus:border-teal-200 dark:focus:border-teal-700 text-slate-600 dark:text-slate-200 text-sm rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/10 shadow-sm cursor-pointer"
              >
                  <option value="all">Todas</option>
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
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.9 }}
                                 onClick={() => handleEdit(t)}
                                 className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm flex items-center justify-between group cursor-pointer transition-all hover:shadow-md"
                               >
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.isPaid ? (t.type === 'income' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600') : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                          <Icon size={20} />
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                            <h4 className={`font-bold text-slate-800 dark:text-slate-200 ${t.isPaid ? '' : 'text-slate-500 dark:text-slate-400'}`}>{t.description}</h4>
                                            {t.isVirtual && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 rounded-md font-bold uppercase">Recorrente</span>}
                                            {t.installments && t.installments > 1 && (
                                               <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 rounded-md font-bold">
                                                  {t.currentInstallment}/{t.installments}
                                               </span>
                                            )}
                                          </div>
                                          <p className="text-xs font-medium text-slate-400">{category?.name || 'Sem Categoria'} • {wallets.find(w => w.id === t.walletId)?.name}</p>
                                      </div>
                                  </div>

                                  <div className="flex items-center gap-6">
                                      <span className={`font-bold text-lg ${t.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                                         {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                      </span>

                                      <div className="flex items-center gap-2">
                                          <button 
                                             onClick={(e) => handleStatusToggle(e, t)}
                                             className={`p-2 rounded-lg transition-colors ${confirmActionId === t.id ? 'bg-orange-100 text-orange-600' : (t.isPaid ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200')}`}
                                             title={t.isPaid ? "Marcar como pendente" : "Marcar como pago"}
                                          >
                                              {confirmActionId === t.id ? <HelpCircle size={18} /> : <CheckCircle2 size={18} />}
                                          </button>
                                          <button 
                                             onClick={(e) => handleDelete(e, t)}
                                             className={`p-2 rounded-lg transition-colors ${isConfirming ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-200 z-10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                             title="Excluir"
                                          >
                                              {isConfirming ? <XCircle size={18} /> : <Trash2 size={18} />}
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

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { useUIStore } from "../../src/store/useUIStore";
import { 
  TrendingUp, TrendingDown, Wallet, Search, Inbox, Pencil, Trash2, 
  CheckCircle2, HelpCircle, XCircle, ChevronLeft, ChevronRight, Activity,
  Utensils, Briefcase, Film, Heart, ShoppingBag, Car, Home, Plane, Coffee, 
  GraduationCap, ShieldCheck, Gift, Zap, ShoppingCart, Phone, Gamepad2, Wifi, Tv,
  Banknote, Coins, PiggyBank, HandCoins, User, Users, Baby, Stethoscope, Shirt, Armchair,
  CreditCard, ArrowUpRight, ArrowDownRight, CalendarRange, AlertTriangle, Droplets,
  EyeOff, Shield, Plus
} from 'lucide-react-native';
import { ModernKPI } from "../../src/components/UI/ModernKPI";
import { FinancialHorizon } from "../../src/components/UI/FinancialHorizon";
import { Header } from "../../src/components/Layout/Header";
import { Transaction } from "../../src/types";

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

export default function Dashboard() {
  const { 
    transactions, categories, wallets, 
    setEditingTransaction, setActiveModal, 
    deleteTransaction, updateTransaction, 
    setRecurrencePendingAction 
  } = useFinanceStore();

  const { isPrivacyMode, theme } = useUIStore();

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
      const dateStr = t.dueDate ? t.dueDate.trim() : '';
      if (!dateStr) return false;

      const tDate = new Date(dateStr + 'T00:00:00');
      
      const matchesMonth = tDate.getMonth() === selectedMonth;
      const matchesYear = tDate.getFullYear() === selectedYear;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
      
      return matchesMonth && matchesYear && matchesSearch && matchesCategory;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [transactions, searchTerm, filterCategory, selectedMonth, selectedYear]);

  const groupedTransactions = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};
      filteredTransactions.forEach(t => {
          const dateKey = t.dueDate.trim();
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

  const handleEdit = (t: Transaction) => { 
    setEditingTransaction(t); 
    setActiveModal(t.type); 
  };
  
  const handleStatusToggle = (t: Transaction) => {
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
    else { 
      setConfirmActionId(t.id); 
      setTimeout(() => setConfirmActionId(null), 3000); 
    }
  };
  
  const handleDelete = (t: Transaction) => {
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

  return (
    <SafeAreaView className="flex-1 bg-brand-gray dark:bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 lg:px-8 py-6">
        {/* KPIs Principais */}
        <View className="gap-5 mb-10">
          <ModernKPI label="Receitas" value={formatCurrency(stats.income)} type="income" isBlurred={isPrivacyMode} />
          <ModernKPI label="Despesas" value={formatCurrency(stats.expense)} type="expense" isBlurred={isPrivacyMode} />
          <ModernKPI label="Balanço Líquido" value={formatCurrency(stats.balance)} type="balance" isBlurred={isPrivacyMode} />
        </View>

        {/* HORIZONTE FINANCEIRO */}
        <FinancialHorizon transactions={transactions} />

        {/* FILTROS E PESQUISA */}
        <View className="bg-white dark:bg-brand-dark p-10 rounded-[60px] border border-brand-gray/10 dark:border-brand-dark shadow-2xl shadow-black/5 mb-12">
          <View className="flex-row items-center justify-between mb-10">
            <TouchableOpacity 
              onPress={() => changeMonth(-1)} 
              className="w-16 h-16 bg-brand-gray dark:bg-brand-dark/50 rounded-[24px] items-center justify-center border border-brand-gray/10 dark:border-brand-dark"
            >
              <ChevronLeft size={28} color={theme === 'dark' ? '#F5F5F5' : '#000000'} />
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.5em] mb-2">Período Selecionado</Text>
              <Text className="font-black text-brand-dark dark:text-white text-3xl tracking-tighter">
                {months[selectedMonth]} {selectedYear}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => changeMonth(1)} 
              className="w-16 h-16 bg-brand-gray dark:bg-brand-dark/50 rounded-[24px] items-center justify-center border border-brand-gray/10 dark:border-brand-dark"
            >
              <ChevronRight size={28} color={theme === 'dark' ? '#F5F5F5' : '#000000'} />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-5">
            <View className="flex-1 relative">
              <View className="absolute left-8 top-1/2 -mt-3.5 z-10">
                <Search size={24} color="#94a3b8" />
              </View>
              <TextInput 
                placeholder="Pesquisar lançamentos..." 
                placeholderTextColor="#94a3b8"
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="w-full pl-20 pr-10 py-6 bg-brand-gray/50 dark:bg-brand-dark/50 rounded-[35px] text-lg font-black text-brand-dark dark:text-white border border-brand-gray/5 dark:border-brand-dark"
              />
            </View>
          </View>
        </View>

        {/* LISTA DE TRANSAÇÕES */}
        <View className="pb-40">
          {Object.keys(groupedTransactions).length === 0 ? (
              <View className="py-32 items-center justify-center">
                  <View className="w-32 h-32 bg-brand-gray dark:bg-brand-dark/50 rounded-[48px] items-center justify-center mb-10 border border-brand-gray/10 dark:border-brand-dark">
                    <Inbox size={64} color="#94a3b8" />
                  </View>
                  <Text className="text-brand-dark/30 dark:text-brand-gray/30 font-black uppercase tracking-[0.3em] text-sm">Nenhum lançamento encontrado</Text>
              </View>
          ) : (
              Object.entries(groupedTransactions).map(([dateKey, groupT]: [string, Transaction[]]) => (
                  <View key={dateKey} className="mb-12">
                      <View className="flex-row items-center gap-5 mb-8 ml-6">
                          <View className="w-2.5 h-2.5 rounded-full bg-brand-green" />
                          <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em]">
                            {getRelativeDateLabel(dateKey)}
                          </Text>
                      </View>
                      
                      <View className="gap-6">
                        {groupT.map((t) => {
                           const category = categories.find(c => c.id === t.categoryId);
                           const Icon = category && iconMap[category.icon] ? iconMap[category.icon] : Utensils;
                           const isConfirming = deleteConfirmId === t.id;
                           const isPaid = t.isPaid;
                           
                           return (
                             <TouchableOpacity 
                               key={t.id}
                               onPress={() => handleEdit(t)}
                               className="bg-white dark:bg-brand-dark p-8 rounded-[50px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-2xl shadow-black/5 flex-row items-center justify-between"
                             >
                                <View className="flex-row items-center gap-8 flex-1">
                                    <View className={`w-20 h-20 rounded-[30px] items-center justify-center border ${isPaid ? (t.type === 'income' ? 'bg-brand-green/10 border-brand-green/20' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30') : 'bg-brand-gray dark:bg-brand-dark/50 border-brand-gray/20 dark:border-brand-dark'}`}>
                                        <Icon size={32} color={isPaid ? (t.type === 'income' ? '#11C76F' : '#EF4444') : '#94a3b8'} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-black text-xl text-brand-dark dark:text-white tracking-tight ${isPaid ? '' : 'opacity-40'}`} numberOfLines={1}>
                                          {t.description}
                                        </Text>
                                        <View className="flex-row items-center gap-3 mt-2">
                                          <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.2em]">
                                            {category?.name || 'Sem Categoria'}
                                          </Text>
                                          <View className="w-1.5 h-1.5 rounded-full bg-brand-gray dark:bg-brand-dark" />
                                          <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.2em]">
                                            {wallets.find(w => w.id === t.walletId)?.name}
                                          </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="items-end gap-5 ml-6">
                                    <Text className={`font-black text-2xl tracking-tighter ${t.type === 'income' ? 'text-brand-green' : 'text-brand-dark dark:text-white'} ${isPrivacyMode ? 'opacity-20' : ''}`}>
                                       {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </Text>
                                    
                                    <View className="flex-row items-center gap-4">
                                        <TouchableOpacity 
                                           onPress={() => handleStatusToggle(t)}
                                           className={`w-14 h-14 rounded-[20px] items-center justify-center border ${confirmActionId === t.id ? 'bg-orange-50 border-orange-200' : (isPaid ? 'bg-brand-green/10 border-brand-green/20' : 'bg-brand-gray dark:bg-brand-dark/50 border-brand-gray/10 dark:border-brand-dark')}`}
                                        >
                                            {confirmActionId === t.id ? <HelpCircle size={24} color="#F97316" /> : <CheckCircle2 size={24} color={isPaid ? '#11C76F' : '#94a3b8'} />}
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                           onPress={() => handleDelete(t)}
                                           className={`w-14 h-14 rounded-[20px] items-center justify-center border ${isConfirming ? 'bg-red-500 border-red-600' : 'bg-brand-gray dark:bg-brand-dark/50 border-brand-gray/10 dark:border-brand-dark'}`}
                                        >
                                            {isConfirming ? <XCircle size={24} color="white" /> : <Trash2 size={24} color={isConfirming ? 'white' : '#94a3b8'} />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                             </TouchableOpacity>
                           );
                        })}
                      </View>
                  </View>
              ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        onPress={() => {
          setEditingTransaction(null);
          setActiveModal('expense');
        }}
        className="absolute bottom-10 right-10 w-24 h-24 bg-brand-green rounded-[35px] items-center justify-center shadow-2xl shadow-brand-green/40"
      >
        <Plus size={48} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}


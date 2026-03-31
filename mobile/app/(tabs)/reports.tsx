import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3, Activity, Target, Sparkles } from "lucide-react-native";
import { Header } from "../../src/components/Layout/Header";
import { useUIStore } from "../../src/store/useUIStore";

export default function Reports() {
  const { transactions, categories } = useFinanceStore();
  const { isPrivacyMode, theme } = useUIStore();
  const isDark = theme === 'dark';

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthT = transactions.filter(t => {
    const d = new Date(t.dueDate + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthT.filter(t => t.type === 'income' && t.isPaid).reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthT.filter(t => t.type === 'expense' && t.isPaid).reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const categorySpending = categories
    .filter(c => c.type === 'expense')
    .map(c => {
      const spent = currentMonthT
        .filter(t => t.categoryId === c.id && t.type === 'expense' && t.isPaid)
        .reduce((acc, t) => acc + t.amount, 0);
      return { ...c, spent };
    })
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const maxSpent = Math.max(...categorySpending.map(c => c.spent), 1);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <SafeAreaView className="flex-1 bg-brand-gray dark:bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 py-6">
        <View className="flex-row items-center gap-4 mb-10 px-2">
          <View className="w-14 h-14 bg-brand-green/10 rounded-[20px] items-center justify-center border border-brand-green/20">
            <PieIcon size={28} color="#11C76F" />
          </View>
          <View>
            <Text className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Relatórios</Text>
            <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em]">Análise de Performance</Text>
          </View>
        </View>

        <View className="flex-row gap-5 mb-10">
          <View className="flex-1 bg-white dark:bg-brand-dark p-8 rounded-[40px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 bg-brand-green/10 rounded-2xl items-center justify-center border border-brand-green/20">
                <TrendingUp size={18} color="#11C76F" />
              </View>
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">Receitas</Text>
            </View>
            <Text className={`text-2xl font-black text-brand-green tracking-tighter ${isPrivacyMode ? 'opacity-20' : ''}`}>
              {formatCurrency(income)}
            </Text>
          </View>
          <View className="flex-1 bg-white dark:bg-brand-dark p-8 rounded-[40px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-2xl items-center justify-center border border-red-100 dark:border-red-900/30">
                <TrendingDown size={18} color="#EF4444" />
              </View>
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">Despesas</Text>
            </View>
            <Text className={`text-2xl font-black text-brand-dark dark:text-white tracking-tighter ${isPrivacyMode ? 'opacity-20' : ''}`}>
              {formatCurrency(expense)}
            </Text>
          </View>
        </View>

        <View className="bg-brand-dark dark:bg-brand-dark/90 p-10 rounded-[50px] border border-brand-dark shadow-2xl mb-12">
          <View className="flex-row items-center justify-between mb-10">
            <View>
              <Text className="text-brand-gray/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-3">Resultado Líquido</Text>
              <Text className={`text-5xl font-black tracking-tighter ${balance >= 0 ? 'text-white' : 'text-red-400'} ${isPrivacyMode ? 'opacity-20' : ''}`}>
                {formatCurrency(balance)}
              </Text>
            </View>
            <View className="w-16 h-16 bg-brand-green rounded-[24px] items-center justify-center shadow-2xl shadow-brand-green/40">
              <BarChart3 size={32} color="white" />
            </View>
          </View>
          
          <View className="gap-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-brand-gray/60 text-[10px] font-bold uppercase tracking-[0.2em]">Comprometimento Mensal</Text>
              <Text className="text-brand-green font-black text-base tracking-tight">
                {income > 0 ? ((expense / income) * 100).toFixed(1) : 0}%
              </Text>
            </View>
            <View className="h-5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
              <View 
                className="h-full bg-brand-green rounded-full" 
                style={{ width: `${income > 0 ? Math.min(100, (expense / income) * 100) : 0}%` }} 
              />
            </View>
            <View className="flex-row items-center gap-4 mt-6 bg-white/5 p-6 rounded-[30px] border border-white/5">
               <Sparkles size={20} color="#11C76F" />
               <Text className="text-[10px] font-bold text-brand-gray/60 uppercase tracking-[0.2em] leading-relaxed flex-1">
                 {income > expense ? 'Seu balanço está saudável este mês!' : 'Atenção aos seus gastos este mês.'}
               </Text>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-brand-dark p-10 rounded-[50px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm mb-20">
          <View className="flex-row items-center gap-5 mb-12">
             <View className="w-14 h-14 bg-brand-gray dark:bg-brand-dark/50 rounded-[20px] items-center justify-center border border-brand-gray/10 dark:border-brand-dark">
                <Target size={28} color={isDark ? '#F5F5F5' : '#000000'} />
             </View>
             <View>
               <Text className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Gastos por Categoria</Text>
               <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em]">Distribuição Mensal</Text>
             </View>
          </View>

          {categorySpending.length === 0 ? (
            <View className="items-center py-20">
              <View className="w-24 h-24 bg-brand-gray dark:bg-brand-dark/50 rounded-[40px] items-center justify-center mb-8">
                <PieIcon size={48} color="#94a3b8" />
              </View>
              <Text className="font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.2em] text-[10px]">Nenhum dado disponível</Text>
            </View>
          ) : (
            categorySpending.map((c) => (
              <View key={c.id} className="mb-12">
                <View className="flex-row justify-between items-center mb-5">
                  <View className="flex-row items-center gap-5">
                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                    <Text className="text-lg font-black text-brand-dark dark:text-white tracking-tight">{c.name}</Text>
                  </View>
                  <Text className={`text-lg font-black text-brand-dark dark:text-white tracking-tighter ${isPrivacyMode ? 'opacity-20' : ''}`}>
                    {formatCurrency(c.spent)}
                  </Text>
                </View>
                <View className="h-4 bg-brand-gray dark:bg-brand-dark/50 rounded-full overflow-hidden border border-brand-gray/5 dark:border-brand-dark">
                  <View 
                    className="h-full rounded-full" 
                    style={{ backgroundColor: c.color, width: `${(c.spent / maxSpent) * 100}%` }} 
                  />
                </View>
                <View className="flex-row justify-between items-center mt-4">
                  <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">
                    {((c.spent / expense) * 100).toFixed(1)}% do total
                  </Text>
                  <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">
                    {formatCurrency(c.spent)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


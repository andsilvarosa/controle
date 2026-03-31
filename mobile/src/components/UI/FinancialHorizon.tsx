import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CalendarRange, AlertTriangle, Activity, Droplets } from 'lucide-react-native';
import { Transaction } from '../../types';
import { useUIStore } from '../../store/useUIStore';

interface FinancialHorizonProps {
  transactions: Transaction[];
}

export const FinancialHorizon: React.FC<FinancialHorizonProps> = ({ transactions }) => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  const projections = useMemo(() => {
    const today = new Date();
    const futureMonths = [];

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
    <View className="space-y-4 my-6">
      <View className="flex-row items-center justify-between px-1">
        <View className="flex-row items-center gap-3">
          <View className="p-2 bg-brand-green/10 rounded-xl">
            <CalendarRange size={24} color="#11C76F" />
          </View>
          <Text className="text-xl font-bold text-brand-dark dark:text-white">
            Horizonte Financeiro
          </Text>
        </View>
        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Projeção 6 Meses
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-4"
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 16 }}
      >
        {projections.map((month, idx) => {
          const isDanger = month.status === 'danger';
          const isWarning = month.status === 'warning';
          
          return (
            <View 
              key={idx}
              className={`w-72 p-6 rounded-4xl border mr-4 ${
                isDanger 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' 
                  : isWarning
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'
                    : 'bg-white dark:bg-brand-dark border-brand-gray/20 dark:border-brand-dark/50'
              }`}
            >
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 dark:text-brand-gray/40 mb-0.5">
                    {month.label}
                  </Text>
                  <Text className="text-[10px] font-bold text-brand-dark/20 dark:text-brand-gray/20">
                    {month.year}
                  </Text>
                </View>
                <View className={`p-2.5 rounded-2xl ${
                   isDanger ? 'bg-red-100' : isWarning ? 'bg-orange-100' : 'bg-brand-green/10'
                }`}>
                   {isDanger ? (
                     <AlertTriangle size={18} color="#EF4444" />
                   ) : isWarning ? (
                     <Activity size={18} color="#F97316" />
                   ) : (
                     <Droplets size={18} color="#11C76F" />
                   )}
                </View>
              </View>

              <View className="mb-6">
                 <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-wider mb-1">
                   Sobra Projetada
                 </Text>
                 <Text className={`text-2xl font-bold tracking-tight ${
                    month.liquid < 0 ? 'text-red-500' : 'text-brand-dark dark:text-white'
                 }`}>
                    {month.liquid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </Text>
              </View>

              <View className="space-y-2">
                 <View className="flex-row justify-between">
                    <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-tighter">
                      Entradas: {month.income.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}
                    </Text>
                    <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-tighter">
                      Saídas: {month.expense.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}
                    </Text>
                 </View>
                 <View className="h-2.5 w-full bg-brand-gray dark:bg-brand-dark/50 rounded-full overflow-hidden">
                    <View 
                      className={`h-full rounded-full ${
                        isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-brand-green'
                      }`}
                      style={{ width: `${Math.min(month.commitment, 100)}%` }}
                    />
                 </View>
                 <Text className={`text-[10px] text-right font-bold mt-1 uppercase tracking-widest ${
                    isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-brand-green'
                 }`}>
                    {month.commitment.toFixed(0)}% Comprometido
                 </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

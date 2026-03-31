import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { useUIStore } from "../src/store/useUIStore";
import { Plus, Pencil, Trash2, ChevronLeft, Target, Sparkles, AlertCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Header } from "../src/components/Layout/Header";

export default function Budgets() {
  const { budgets, categories, setActiveModal, setEditingBudget, deleteBudget, transactions } = useFinanceStore();
  const { theme } = useUIStore();
  const router = useRouter();
  const isDark = theme === 'dark';

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setActiveModal('budget');
  };

  const handleAdd = () => {
    setEditingBudget(null);
    setActiveModal('budget');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Orçamento",
      "Tem certeza que deseja excluir este orçamento de gastos?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteBudget(id) }
      ]
    );
  };

  const getCategory = (id: string) => {
    return categories.find(c => c.id === id);
  };

  const getSpent = (categoryId: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        const d = new Date(t.dueDate);
        return t.categoryId === categoryId && 
               t.type === 'expense' && 
               d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-gray dark:bg-black">
      <Header />
      
      <View className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-8 px-1">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2 bg-white dark:bg-brand-dark rounded-xl border border-brand-gray/10 dark:border-brand-dark/50"
            >
              <ChevronLeft size={20} color={isDark ? "#F5F5F5" : "#000000"} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight">Orçamentos</Text>
              <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Metas de Gastos</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleAdd}
            className="w-12 h-12 bg-brand-green rounded-2xl items-center justify-center shadow-lg shadow-brand-green/20"
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {budgets.length === 0 ? (
            <View className="items-center justify-center py-20 bg-white dark:bg-brand-dark rounded-4xl border border-brand-gray/10 dark:border-brand-dark/50">
              <Target size={48} color={isDark ? "#F5F5F520" : "#00000010"} />
              <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-bold mt-4 uppercase tracking-widest text-[10px]">Nenhum orçamento cadastrado</Text>
            </View>
          ) : (
            <View className="gap-4 mb-12">
              {budgets.map((budget) => {
                const category = getCategory(budget.categoryId);
                const spent = getSpent(budget.categoryId);
                const percent = Math.min(100, (spent / budget.amount) * 100);
                const isExceeded = spent > budget.amount;

                return (
                  <View 
                    key={budget.id} 
                    className="bg-white dark:bg-brand-dark p-6 rounded-4xl border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-6">
                      <View className="flex-row items-center gap-3">
                        <View 
                          className="w-10 h-10 rounded-xl items-center justify-center"
                          style={{ backgroundColor: category ? `${category.color}15` : '#F3F4F6' }}
                        >
                          <Target size={20} color={category?.color || '#9CA3AF'} />
                        </View>
                        <View>
                          <Text className="text-lg font-bold text-brand-dark dark:text-white tracking-tight">{category?.name || 'Categoria'}</Text>
                          <Text className="text-[9px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Meta Mensal</Text>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity 
                          onPress={() => handleEdit(budget)}
                          className="w-9 h-9 bg-brand-gray dark:bg-brand-dark/50 rounded-lg items-center justify-center border border-brand-gray/20 dark:border-brand-dark"
                        >
                          <Pencil size={16} color={isDark ? "#F5F5F5" : "#000000"} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(budget.id)}
                          className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg items-center justify-center border border-red-100 dark:border-red-900/30"
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-end mb-4">
                      <View>
                        <Text className="text-[9px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest mb-1">Gasto Atual</Text>
                        <Text className={`text-xl font-bold ${isExceeded ? 'text-red-500' : 'text-brand-green'}`}>
                          R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[9px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest mb-1">Limite</Text>
                        <Text className="text-lg font-bold text-brand-dark dark:text-white">R$ {budget.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                      </View>
                    </View>

                    <View className="h-2.5 bg-brand-gray dark:bg-brand-dark/50 rounded-full overflow-hidden mb-2">
                      <View 
                        className={`h-full rounded-full ${isExceeded ? 'bg-red-500' : 'bg-brand-green'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </View>
                    
                    <View className="flex-row justify-between items-center">
                       {isExceeded && (
                         <View className="flex-row items-center gap-1">
                           <AlertCircle size={10} color="#EF4444" />
                           <Text className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Orçamento Excedido</Text>
                         </View>
                       )}
                       <Text className={`text-right text-[10px] font-bold uppercase tracking-widest ml-auto ${isExceeded ? 'text-red-500' : 'text-brand-dark/40 dark:text-brand-gray/40'}`}>
                         {percent.toFixed(0)}% Utilizado
                       </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View className="items-center mb-12">
             <View className="flex-row items-center gap-2 mb-2">
                <Sparkles size={14} color="#11C76F" />
                <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-bold text-[10px] uppercase tracking-[0.3em]">SOS Controle</Text>
             </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


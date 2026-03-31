import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useFinanceStore } from "../store/useFinanceStore";
import { useUIStore } from "../store/useUIStore";
import { X, Repeat, Calendar, CheckCircle2, AlertCircle } from "lucide-react-native";

export function RecurrenceActionModal() {
  const { activeModal, setActiveModal, editingTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  const handleAction = (action: 'only-this' | 'all-future' | 'all') => {
    // In a real app, this would handle the logic for recurring transactions
    // For now, we'll just close the modal
    console.log(`Recurrence action: ${action} for transaction ${editingTransaction?.id}`);
    setActiveModal(null);
  };

  if (activeModal !== 'recurrence-action') return null;

  return (
    <Modal
      visible={activeModal === 'recurrence-action'}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-brand-gray dark:bg-black rounded-[50px] p-10 w-full max-w-md border border-white/10 dark:border-brand-dark/50 shadow-2xl">
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-brand-green/10 rounded-2xl items-center justify-center border border-brand-green/20">
                <Repeat size={22} color="#11C76F" />
              </View>
              <View>
                <Text className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Recorrência</Text>
                <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Série de Lançamentos</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setActiveModal(null)} 
              className="w-12 h-12 bg-white dark:bg-brand-dark rounded-full items-center justify-center border border-brand-gray/10 dark:border-brand-dark"
            >
              <X size={22} color={isDark ? "#F5F5F5" : "#000000"} />
            </TouchableOpacity>
          </View>

          <Text className="text-brand-dark/60 dark:text-brand-gray/60 mb-10 text-center font-bold text-base leading-relaxed">
            Esta é uma transação recorrente. Quais instâncias você deseja alterar?
          </Text>

          <View className="gap-5">
            <TouchableOpacity
              onPress={() => handleAction('only-this')}
              className="flex-row items-center bg-white dark:bg-brand-dark p-6 rounded-[30px] border border-brand-gray/10 dark:border-brand-dark shadow-sm"
            >
              <View className="w-14 h-14 bg-brand-green/10 rounded-[20px] items-center justify-center mr-5">
                <Calendar size={24} color="#11C76F" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-dark dark:text-white font-black text-base">Apenas esta</Text>
                <Text className="text-brand-dark/40 dark:text-brand-gray/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Altera apenas o selecionado</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAction('all-future')}
              className="flex-row items-center bg-white dark:bg-brand-dark p-6 rounded-[30px] border border-brand-gray/10 dark:border-brand-dark shadow-sm"
            >
              <View className="w-14 h-14 bg-brand-green/10 rounded-[20px] items-center justify-center mr-5">
                <Repeat size={24} color="#11C76F" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-dark dark:text-white font-black text-base">Esta e as próximas</Text>
                <Text className="text-brand-dark/40 dark:text-brand-gray/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Altera futuras instâncias</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAction('all')}
              className="flex-row items-center bg-white dark:bg-brand-dark p-6 rounded-[30px] border border-brand-gray/10 dark:border-brand-dark shadow-sm"
            >
              <View className="w-14 h-14 bg-brand-green/10 rounded-[20px] items-center justify-center mr-5">
                <CheckCircle2 size={24} color="#11C76F" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-dark dark:text-white font-black text-base">Todas as instâncias</Text>
                <Text className="text-brand-dark/40 dark:text-brand-gray/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Altera toda a série</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[30px] flex-row items-center border border-amber-100 dark:border-amber-900/20">
            <AlertCircle size={22} color="#d97706" className="mr-4" />
            <Text className="text-amber-800 dark:text-amber-200/60 text-[10px] font-bold uppercase tracking-widest flex-1 leading-5">
              Alterar todas as instâncias pode afetar seus relatórios de meses anteriores.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

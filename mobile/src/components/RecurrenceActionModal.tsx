import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useFinanceStore } from "../store/useFinanceStore";
import { X, Repeat, Calendar, CheckCircle2, AlertCircle } from "lucide-react-native";

export function RecurrenceActionModal() {
  const { activeModal, setActiveModal, editingTransaction, updateTransaction, deleteTransaction } = useFinanceStore();

  const handleAction = (action: 'only-this' | 'all-future' | 'all') => {
    // In a real app, this would handle the logic for recurring transactions
    // For now, we'll just close the modal
    console.log(`Recurrence action: ${action} for transaction ${editingTransaction?.id}`);
    setActiveModal(null);
  };

  return (
    <Modal
      visible={activeModal === 'recurrence-action'}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Repeat size={20} color="#0d9488" className="mr-2" />
              <Text className="text-xl font-bold text-gray-900">Transação Recorrente</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-6 text-center">
            Esta é uma transação recorrente. Quais instâncias você deseja alterar?
          </Text>

          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => handleAction('only-this')}
              className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100"
            >
              <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-4">
                <Calendar size={20} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold">Apenas esta</Text>
                <Text className="text-gray-400 text-xs">Altera apenas a transação selecionada</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAction('all-future')}
              className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100"
            >
              <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-4">
                <Repeat size={20} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold">Esta e as próximas</Text>
                <Text className="text-gray-400 text-xs">Altera esta e todas as futuras instâncias</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAction('all')}
              className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100"
            >
              <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-4">
                <CheckCircle2 size={20} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold">Todas as instâncias</Text>
                <Text className="text-gray-400 text-xs">Altera todas as transações desta série</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-6 p-4 bg-amber-50 rounded-2xl flex-row items-center">
            <AlertCircle size={20} color="#d97706" className="mr-3" />
            <Text className="text-amber-800 text-xs flex-1">
              Alterar todas as instâncias pode afetar seus relatórios de meses anteriores.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

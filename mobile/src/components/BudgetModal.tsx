import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { X, Check } from 'lucide-react-native';

export function BudgetModal() {
  const { activeModal, setActiveModal, addBudget, updateBudget, editingBudget, setEditingBudget, categories } = useFinanceStore();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (editingBudget) {
      setAmount(editingBudget.amount.toString());
      setCategoryId(editingBudget.categoryId);
    } else {
      resetFields();
      if (categories.length > 0) setCategoryId(categories[0].id);
    }
  }, [editingBudget, categories]);

  const resetFields = () => {
    setAmount('');
    setCategoryId('');
  };

  const handleSave = async () => {
    if (!amount || !categoryId) return;

    const budgetData = {
      id: editingBudget?.id || Math.random().toString(36).substring(2, 9),
      amount: parseFloat(amount),
      categoryId,
      period: 'monthly' as const,
    };

    if (editingBudget) {
      await updateBudget(budgetData);
    } else {
      await addBudget(budgetData);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    resetFields();
    setEditingBudget(null);
    setActiveModal(null);
  };

  if (activeModal !== 'budget') return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={activeModal === 'budget'}
      onRequestClose={resetAndClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-3xl p-6"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </Text>
            <TouchableOpacity onPress={resetAndClose}>
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Valor Mensal (R$)</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-900"
                placeholder="Ex: 500,00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-500 mb-2">Categoria:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    className={`px-4 py-2 rounded-full border ${categoryId === c.id ? 'bg-teal-600 border-teal-600' : 'border-gray-200'}`}
                  >
                    <Text className={`${categoryId === c.id ? 'text-white' : 'text-gray-600'}`}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-teal-600 py-4 rounded-xl items-center mb-4"
            >
              <Text className="text-white font-bold text-lg">Salvar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

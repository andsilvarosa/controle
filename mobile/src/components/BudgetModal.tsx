import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUIStore } from '../store/useUIStore';
import { X, Check, Target, PieChart } from 'lucide-react-native';

export function BudgetModal() {
  const { activeModal, setActiveModal, addBudget, updateBudget, editingBudget, setEditingBudget, categories } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

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
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-brand-gray dark:bg-black rounded-t-[50px] p-10 border-t border-white/10 dark:border-brand-dark/50 shadow-2xl"
        >
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-brand-green/10 rounded-2xl items-center justify-center border border-brand-green/20">
                <Target size={22} color="#11C76F" />
              </View>
              <View>
                <Text className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                  {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                </Text>
                <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Planejamento Mensal</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={resetAndClose}
              className="w-12 h-12 bg-white dark:bg-brand-dark rounded-full items-center justify-center border border-brand-gray/10 dark:border-brand-dark"
            >
              <X size={22} color={isDark ? "#F5F5F5" : "#000000"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[75vh]">
            <View className="mb-8">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Valor Mensal</Text>
              <View className="flex-row items-center bg-white dark:bg-brand-dark rounded-[30px] border border-brand-gray/10 dark:border-brand-dark overflow-hidden shadow-sm">
                <View className="bg-brand-gray/50 dark:bg-brand-dark/80 px-6 py-6 border-r border-brand-gray/10 dark:border-brand-dark">
                  <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-black text-xs">R$</Text>
                </View>
                <TextInput
                  className="flex-1 p-6 text-brand-dark dark:text-white font-black text-2xl"
                  placeholder="0,00"
                  placeholderTextColor={isDark ? "#4A4A4A" : "#94a3b8"}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-5">Categoria do Orçamento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4">
                {categories.map(c => {
                  const isSelected = categoryId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      className={`px-6 py-4 rounded-[20px] border ${isSelected ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20' : 'bg-white dark:bg-brand-dark border-brand-gray/10 dark:border-brand-dark shadow-sm'}`}
                    >
                      <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${isSelected ? 'text-white' : 'text-brand-dark/60 dark:text-brand-gray/60'}`}>{c.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-brand-green py-8 rounded-[30px] items-center shadow-2xl shadow-brand-green/30 mb-12"
            >
              <Text className="text-white font-black text-lg tracking-tight uppercase">Salvar Orçamento</Text>
            </TouchableOpacity>
            
            <View className="h-16" />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

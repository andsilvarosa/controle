import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { X, ChevronDown } from 'lucide-react-native';

export function TransactionModal() {
  const { activeModal, setActiveModal, addTransaction, wallets, categories, editingTransaction, setEditingTransaction, updateTransaction } = useFinanceStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(activeModal === 'income' ? 'income' : 'expense');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.categoryId);
      setWalletId(editingTransaction.walletId || '');
      setDate(editingTransaction.date);
    } else {
      setType(activeModal === 'income' ? 'income' : 'expense');
      if (categories.length > 0) {
        const firstMatch = categories.find(c => c.type === (activeModal === 'income' ? 'income' : 'expense'));
        setCategoryId(firstMatch?.id || categories[0].id);
      }
      if (wallets.length > 0) setWalletId(wallets[0].id);
    }
  }, [editingTransaction, activeModal, categories, wallets]);

  const handleSave = async () => {
    if (!description || !amount || !categoryId || !walletId) return;

    const transactionData = {
      id: editingTransaction?.id || Math.random().toString(36).substring(2, 9),
      description,
      amount: parseFloat(amount),
      type,
      date,
      dueDate: date,
      isPaid: true,
      categoryId,
      walletId,
      isRecurring: false,
      recurrence: 'none' as const,
    };

    if (editingTransaction) {
      await updateTransaction(transactionData);
    } else {
      await addTransaction(transactionData);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setDescription('');
    setAmount('');
    setEditingTransaction(null);
    setActiveModal(null);
  };

  if (!activeModal || (activeModal !== 'income' && activeModal !== 'expense')) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!activeModal}
      onRequestClose={resetAndClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-3xl p-6"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              {editingTransaction ? 'Editar' : 'Nova'} {type === 'income' ? 'Receita' : 'Despesa'}
            </Text>
            <TouchableOpacity onPress={resetAndClose}>
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
            <View className="flex-row mb-6 bg-gray-100 p-1 rounded-xl">
              <TouchableOpacity 
                onPress={() => setType('income')}
                className={`flex-1 py-2 rounded-lg items-center ${type === 'income' ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`font-bold ${type === 'income' ? 'text-green-600' : 'text-gray-500'}`}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setType('expense')}
                className={`flex-1 py-2 rounded-lg items-center ${type === 'expense' ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`font-bold ${type === 'expense' ? 'text-red-600' : 'text-gray-500'}`}>Despesa</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Descrição</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-900"
                placeholder="Ex: Aluguel, Salário..."
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Valor (R$)</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-900"
                placeholder="0,00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Carteira</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {wallets.map(w => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => setWalletId(w.id)}
                    className={`px-4 py-2 rounded-full border ${walletId === w.id ? 'bg-teal-600 border-teal-600' : 'border-gray-200'}`}
                  >
                    <Text className={`${walletId === w.id ? 'text-white' : 'text-gray-600'}`}>{w.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-6">
              <Text className="text-gray-500 mb-2">Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {filteredCategories.map(c => (
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
              className={`py-4 rounded-xl items-center ${type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}
            >
              <Text className="text-white font-bold text-lg">Salvar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

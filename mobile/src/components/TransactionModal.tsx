import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { X, ChevronDown, Calendar as CalendarIcon, Repeat } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RecurrencePeriod } from '../types';

export function TransactionModal() {
  const { activeModal, setActiveModal, addTransaction, wallets, categories, editingTransaction, setEditingTransaction, updateTransaction } = useFinanceStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(activeModal === 'income' ? 'income' : 'expense');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrencePeriod>('none');
  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.categoryId);
      setWalletId(editingTransaction.walletId || '');
      setDate(new Date(editingTransaction.date));
      setRecurrence(editingTransaction.recurrence);
      setInstallments(editingTransaction.installments?.toString() || '1');
    } else {
      setType(activeModal === 'income' ? 'income' : 'expense');
      if (categories.length > 0) {
        const firstMatch = categories.find(c => c.type === (activeModal === 'income' ? 'income' : 'expense'));
        setCategoryId(firstMatch?.id || categories[0].id);
      }
      if (wallets.length > 0) setWalletId(wallets[0].id);
      setRecurrence('none');
      setInstallments('1');
      setDate(new Date());
    }
  }, [editingTransaction, activeModal, categories, wallets]);

  const handleSave = async () => {
    if (!description || !amount || !categoryId || !walletId) return;

    const transactionData = {
      id: editingTransaction?.id || Math.random().toString(36).substring(2, 9),
      description,
      amount: parseFloat(amount),
      type,
      date: date.toISOString().split('T')[0],
      dueDate: date.toISOString().split('T')[0],
      isPaid: true,
      categoryId,
      walletId,
      isRecurring: recurrence !== 'none',
      recurrence,
      installments: recurrence === 'fixed' ? parseInt(installments) : undefined,
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  if (!activeModal || (activeModal !== 'income' && activeModal !== 'expense')) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  const recurrenceOptions: { label: string, value: RecurrencePeriod }[] = [
    { label: 'Nenhuma', value: 'none' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensal', value: 'monthly' },
    { label: 'Anual', value: 'annual' },
    { label: 'Parcelado', value: 'fixed' },
  ];

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

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-500 mb-2">Data</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  className="bg-gray-100 p-4 rounded-xl flex-row items-center justify-between"
                >
                  <Text className="text-gray-900">{date.toLocaleDateString()}</Text>
                  <CalendarIcon size={18} color="#9ca3af" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Repetir</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {recurrenceOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setRecurrence(opt.value)}
                    className={`px-4 py-2 rounded-full border ${recurrence === opt.value ? 'bg-teal-600 border-teal-600' : 'border-gray-200'}`}
                  >
                    <Text className={`${recurrence === opt.value ? 'text-white' : 'text-gray-600'}`}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {recurrence === 'fixed' && (
              <View className="mb-4">
                <Text className="text-gray-500 mb-2">Número de Parcelas</Text>
                <TextInput
                  className="bg-gray-100 p-4 rounded-xl text-gray-900"
                  placeholder="Ex: 12"
                  keyboardType="numeric"
                  value={installments}
                  onChangeText={setInstallments}
                />
              </View>
            )}

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

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUIStore } from '../store/useUIStore';
import { X, ChevronDown, Calendar as CalendarIcon, Repeat, Sparkles, Wallet as WalletIcon, LayoutGrid } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RecurrencePeriod } from '../types';

export function TransactionModal() {
  const { activeModal, setActiveModal, addTransaction, wallets, categories, editingTransaction, setEditingTransaction, updateTransaction } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

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
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-brand-gray dark:bg-black rounded-t-[50px] p-10 border-t border-white/10 dark:border-brand-dark/50 shadow-2xl"
        >
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center gap-4">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${type === 'income' ? 'bg-brand-green/10 border-brand-green/20' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'}`}>
                <Sparkles size={22} color={type === 'income' ? '#11C76F' : '#EF4444'} />
              </View>
              <View>
                <Text className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                  {editingTransaction ? 'Editar' : 'Nova'} {type === 'income' ? 'Receita' : 'Despesa'}
                </Text>
                <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Lançamento Financeiro</Text>
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
            <View className="flex-row mb-10 bg-white dark:bg-brand-dark p-2 rounded-[24px] border border-brand-gray/10 dark:border-brand-dark">
              <TouchableOpacity 
                onPress={() => setType('income')}
                className={`flex-1 py-4 rounded-[18px] items-center ${type === 'income' ? 'bg-brand-green shadow-lg shadow-brand-green/20' : ''}`}
              >
                <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${type === 'income' ? 'text-white' : 'text-brand-dark/40 dark:text-brand-gray/40'}`}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setType('expense')}
                className={`flex-1 py-4 rounded-[18px] items-center ${type === 'expense' ? 'bg-red-500 shadow-lg shadow-red-500/20' : ''}`}
              >
                <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${type === 'expense' ? 'text-white' : 'text-brand-dark/40 dark:text-brand-gray/40'}`}>Despesa</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-8">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Descrição do Lançamento</Text>
              <TextInput
                className="bg-white dark:bg-brand-dark p-6 rounded-[30px] text-brand-dark dark:text-white font-black text-base border border-brand-gray/10 dark:border-brand-dark shadow-sm"
                placeholder="Ex: Aluguel, Salário..."
                placeholderTextColor={isDark ? "#4A4A4A" : "#94a3b8"}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="mb-8">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Valor Total</Text>
              <View className="relative">
                <View className="absolute left-6 top-1/2 -mt-3 z-10">
                  <Text className="text-brand-dark/20 dark:text-brand-gray/20 font-black text-lg">R$</Text>
                </View>
                <TextInput
                  className="bg-white dark:bg-brand-dark pl-16 pr-6 py-8 rounded-[30px] text-4xl font-black text-brand-dark dark:text-white border border-brand-gray/10 dark:border-brand-dark shadow-sm"
                  placeholder="0,00"
                  placeholderTextColor={isDark ? "#4A4A4A" : "#94a3b8"}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Data de Vencimento</Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                className="bg-white dark:bg-brand-dark p-6 rounded-[30px] flex-row items-center justify-between border border-brand-gray/10 dark:border-brand-dark shadow-sm"
              >
                <Text className="text-brand-dark dark:text-white font-black text-base">{date.toLocaleDateString('pt-BR')}</Text>
                <View className="w-10 h-10 bg-brand-green/10 rounded-xl items-center justify-center">
                   <CalendarIcon size={20} color="#11C76F" />
                </View>
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

            <View className="mb-8">
              <View className="flex-row items-center gap-2 mb-3 ml-4">
                <Repeat size={12} color="#11C76F" />
                <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">Recorrência</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                {recurrenceOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setRecurrence(opt.value)}
                    className={`px-6 py-4 rounded-[20px] border ${recurrence === opt.value ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20' : 'bg-white dark:bg-brand-dark border-brand-gray/10 dark:border-brand-dark shadow-sm'}`}
                  >
                    <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${recurrence === opt.value ? 'text-white' : 'text-brand-dark/60 dark:text-brand-gray/60'}`}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {recurrence === 'fixed' && (
              <View className="mb-8">
                <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Número de Parcelas</Text>
                <TextInput
                  className="bg-white dark:bg-brand-dark p-6 rounded-[30px] text-brand-dark dark:text-white font-black text-base border border-brand-gray/10 dark:border-brand-dark shadow-sm"
                  placeholder="Ex: 12"
                  placeholderTextColor={isDark ? "#4A4A4A" : "#94a3b8"}
                  keyboardType="numeric"
                  value={installments}
                  onChangeText={setInstallments}
                />
              </View>
            )}

            <View className="mb-8">
              <View className="flex-row items-center gap-2 mb-3 ml-4">
                <WalletIcon size={12} color="#11C76F" />
                <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">Carteira de Origem</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                {wallets.map(w => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => setWalletId(w.id)}
                    className={`px-6 py-4 rounded-[20px] border ${walletId === w.id ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20' : 'bg-white dark:bg-brand-dark border-brand-gray/10 dark:border-brand-dark shadow-sm'}`}
                  >
                    <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${walletId === w.id ? 'text-white' : 'text-brand-dark/60 dark:text-brand-gray/60'}`}>{w.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-12">
              <View className="flex-row items-center gap-2 mb-3 ml-4">
                <LayoutGrid size={12} color="#11C76F" />
                <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">Categoria</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                {filteredCategories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    className={`px-6 py-4 rounded-[20px] border ${categoryId === c.id ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20' : 'bg-white dark:bg-brand-dark border-brand-gray/10 dark:border-brand-dark shadow-sm'}`}
                  >
                    <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${categoryId === c.id ? 'text-white' : 'text-brand-dark/60 dark:text-brand-gray/60'}`}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className={`py-8 rounded-[30px] items-center shadow-2xl ${type === 'income' ? 'bg-brand-green shadow-brand-green/30' : 'bg-red-500 shadow-red-500/30'}`}
            >
              <Text className="text-white font-black text-lg tracking-tight uppercase">Confirmar Lançamento</Text>
            </TouchableOpacity>
            
            <View className="h-16" />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

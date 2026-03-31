import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUIStore } from '../store/useUIStore';
import { X, Check, Wallet, Landmark, CreditCard, Banknote, TrendingUp, PiggyBank, Plane } from 'lucide-react-native';
import { WalletType, CurrencyCode } from '../types';

const WALLET_TYPES: { label: string; value: WalletType; icon: any }[] = [
  { label: 'Conta Corrente', value: 'checking', icon: Landmark },
  { label: 'Cartão de Crédito', value: 'credit_card', icon: CreditCard },
  { label: 'Dinheiro', value: 'cash', icon: Banknote },
  { label: 'Investimento', value: 'investment', icon: TrendingUp },
  { label: 'Poupança', value: 'savings', icon: PiggyBank },
  { label: 'Viagem', value: 'travel', icon: Plane },
];

const CURRENCIES: CurrencyCode[] = ['BRL', 'USD', 'EUR', 'GBP'];

export function WalletModal() {
  const { activeModal, setActiveModal, addWallet, updateWallet, editingWallet, setEditingWallet } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<WalletType>('checking');
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [color, setColor] = useState('#11C76F');

  useEffect(() => {
    if (editingWallet) {
      setName(editingWallet.name);
      setBalance(editingWallet.balance.toString());
      setType(editingWallet.type);
      setCurrency(editingWallet.currency || 'BRL');
      setColor(editingWallet.color);
    } else {
      resetFields();
    }
  }, [editingWallet]);

  const resetFields = () => {
    setName('');
    setBalance('');
    setType('checking');
    setCurrency('BRL');
    setColor('#11C76F');
  };

  const handleSave = async () => {
    if (!name) return;

    const walletData = {
      id: editingWallet?.id || Math.random().toString(36).substring(2, 9),
      name,
      balance: parseFloat(balance) || 0,
      type,
      currency,
      color,
    };

    if (editingWallet) {
      await updateWallet(walletData);
    } else {
      await addWallet(walletData);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    resetFields();
    setEditingWallet(null);
    setActiveModal(null);
  };

  if (activeModal !== 'wallet') return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={activeModal === 'wallet'}
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
                <Wallet size={22} color="#11C76F" />
              </View>
              <View>
                <Text className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                  {editingWallet ? 'Editar Carteira' : 'Nova Carteira'}
                </Text>
                <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Gestão de Contas</Text>
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
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Nome da Carteira</Text>
              <TextInput
                className="bg-white dark:bg-brand-dark p-6 rounded-[30px] text-brand-dark dark:text-white font-black text-base border border-brand-gray/10 dark:border-brand-dark shadow-sm"
                placeholder="Ex: Nubank, Carteira, Itaú..."
                placeholderTextColor={isDark ? "#4A4A4A" : "#94a3b8"}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mb-8">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Saldo Inicial</Text>
              <View className="flex-row items-center bg-white dark:bg-brand-dark rounded-[30px] border border-brand-gray/10 dark:border-brand-dark overflow-hidden shadow-sm">
                <View className="bg-brand-gray/50 dark:bg-brand-dark/80 px-6 py-6 border-r border-brand-gray/10 dark:border-brand-dark">
                  <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-black text-xs">{currency}</Text>
                </View>
                <TextInput
                  className="flex-1 p-6 text-brand-dark dark:text-white font-black text-2xl"
                  placeholder="0,00"
                  placeholderTextColor={isDark ? "#4A4A4A" : "#94a3b8"}
                  keyboardType="numeric"
                  value={balance}
                  onChangeText={setBalance}
                />
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-5">Tipo de Carteira</Text>
              <View className="flex-row flex-wrap gap-4">
                {WALLET_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.value;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => setType(t.value)}
                      className={`flex-row items-center px-6 py-4 rounded-[20px] border ${isSelected ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20' : 'bg-white dark:bg-brand-dark border-brand-gray/10 dark:border-brand-dark shadow-sm'}`}
                    >
                      <Icon size={18} color={isSelected ? "white" : isDark ? "#F5F5F5" : "#94a3b8"} />
                      <Text className={`ml-3 font-black text-[10px] uppercase tracking-[0.2em] ${isSelected ? 'text-white' : 'text-brand-dark/60 dark:text-brand-gray/60'}`}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-5">Moeda Padrão</Text>
              <View className="flex-row gap-4">
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCurrency(c)}
                    className={`flex-1 py-5 rounded-[20px] border items-center ${currency === c ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20' : 'bg-white dark:bg-brand-dark border-brand-gray/10 dark:border-brand-dark shadow-sm'}`}
                  >
                    <Text className={`font-black text-xs tracking-[0.2em] ${currency === c ? 'text-white' : 'text-brand-dark/60 dark:text-brand-gray/60'}`}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-brand-green py-8 rounded-[30px] items-center shadow-2xl shadow-brand-green/30 mb-12"
            >
              <Text className="text-white font-black text-lg tracking-tight uppercase">Salvar Carteira</Text>
            </TouchableOpacity>
            
            <View className="h-16" />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

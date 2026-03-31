import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { X, Check } from 'lucide-react-native';
import { WalletType, CurrencyCode } from '../types';

const WALLET_TYPES: { label: string; value: WalletType }[] = [
  { label: 'Conta Corrente', value: 'checking' },
  { label: 'Cartão de Crédito', value: 'credit_card' },
  { label: 'Dinheiro', value: 'cash' },
  { label: 'Investimento', value: 'investment' },
  { label: 'Poupança', value: 'savings' },
  { label: 'Viagem', value: 'travel' },
];

const CURRENCIES: CurrencyCode[] = ['BRL', 'USD', 'EUR', 'GBP'];

export function WalletModal() {
  const { activeModal, setActiveModal, addWallet, updateWallet, editingWallet, setEditingWallet } = useFinanceStore();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<WalletType>('checking');
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [color, setColor] = useState('#0d9488');

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
    setColor('#0d9488');
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
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-3xl p-6"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              {editingWallet ? 'Editar Carteira' : 'Nova Carteira'}
            </Text>
            <TouchableOpacity onPress={resetAndClose}>
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Nome da Carteira</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-900"
                placeholder="Ex: Nubank, Carteira, Itaú..."
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Saldo Inicial (R$)</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-900"
                placeholder="0,00"
                keyboardType="numeric"
                value={balance}
                onChangeText={setBalance}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Tipo de Carteira</Text>
              <View className="flex-row flex-wrap gap-2">
                {WALLET_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setType(t.value)}
                    className={`px-4 py-2 rounded-full border ${type === t.value ? 'bg-teal-600 border-teal-600' : 'border-gray-200'}`}
                  >
                    <Text className={`${type === t.value ? 'text-white' : 'text-gray-600'}`}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-500 mb-2">Moeda</Text>
              <View className="flex-row gap-2">
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCurrency(c)}
                    className={`flex-1 py-3 rounded-xl border items-center ${currency === c ? 'bg-teal-600 border-teal-600' : 'border-gray-200'}`}
                  >
                    <Text className={`font-bold ${currency === c ? 'text-white' : 'text-gray-600'}`}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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

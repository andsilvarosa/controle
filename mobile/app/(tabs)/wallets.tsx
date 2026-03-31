import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { Wallet as WalletIcon, Plus, Pencil, ChevronRight, ShieldCheck, Sparkles } from "lucide-react-native";
import { Header } from "../../src/components/Layout/Header";
import { useUIStore } from "../../src/store/useUIStore";

export default function Wallets() {
  const { wallets, setActiveModal, setEditingWallet } = useFinanceStore();
  const { isPrivacyMode, theme } = useUIStore();
  const isDark = theme === 'dark';

  const handleEdit = (wallet: any) => {
    setEditingWallet(wallet);
    setActiveModal('wallet');
  };

  const handleAdd = () => {
    setEditingWallet(null);
    setActiveModal('wallet');
  };

  const formatCurrency = (val: number, currency: string = 'BRL') => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-gray dark:bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-10 px-2">
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 bg-brand-green/10 rounded-[20px] items-center justify-center border border-brand-green/20">
              <WalletIcon size={28} color="#11C76F" />
            </View>
            <View>
              <Text className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Minhas Carteiras</Text>
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em]">Gestão de Ativos</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleAdd}
            className="w-14 h-14 bg-brand-green rounded-[20px] items-center justify-center shadow-2xl shadow-brand-green/30"
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        </View>

        {wallets.length === 0 ? (
          <View className="bg-white dark:bg-brand-dark p-16 rounded-[50px] items-center justify-center border border-brand-gray/10 dark:border-brand-dark shadow-sm">
            <View className="w-24 h-24 bg-brand-gray dark:bg-brand-dark/50 rounded-[40px] items-center justify-center mb-8">
              <WalletIcon size={48} color="#94a3b8" />
            </View>
            <Text className="text-brand-dark/30 dark:text-brand-gray/30 font-black text-center uppercase tracking-[0.2em] text-xs">
              Nenhuma carteira encontrada
            </Text>
            <TouchableOpacity 
              onPress={handleAdd}
              className="mt-10 px-12 py-6 bg-brand-green rounded-[24px] shadow-2xl shadow-brand-green/30"
            >
              <Text className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Criar Primeira Carteira</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => handleEdit(wallet)}
              className="bg-white dark:bg-brand-dark p-8 rounded-[40px] mb-6 border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm flex-row items-center"
            >
              <View 
                className="w-16 h-16 rounded-[24px] items-center justify-center mr-6 border border-brand-gray/5 dark:border-brand-dark/20"
                style={{ backgroundColor: `${wallet.color}15` }}
              >
                <WalletIcon size={28} color={wallet.color || '#11C76F'} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-xl font-black text-brand-dark dark:text-white tracking-tight">{wallet.name}</Text>
                  {wallet.isDefault && (
                    <View className="p-1.5 bg-brand-green/10 rounded-xl">
                      <ShieldCheck size={12} color="#11C76F" />
                    </View>
                  )}
                </View>
                <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em]">
                  {wallet.type === 'bank' ? 'Conta Bancária' : wallet.type === 'investment' ? 'Investimento' : 'Dinheiro'}
                </Text>
              </View>
              <View className="items-end gap-2">
                <Text className={`text-2xl font-black text-brand-dark dark:text-white tracking-tighter ${isPrivacyMode ? 'opacity-20' : ''}`}>
                  {formatCurrency(wallet.balance, wallet.currency)}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[10px] font-bold text-brand-green uppercase tracking-[0.2em]">Detalhes</Text>
                  <ChevronRight size={14} color="#11C76F" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


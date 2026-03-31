import React from 'react';
import { View, Text } from 'react-native';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';

interface ModernKPIProps {
  label: string;
  value: string;
  type: 'income' | 'expense' | 'balance';
  isBlurred: boolean;
}

export const ModernKPI: React.FC<ModernKPIProps> = ({ label, value, type, isBlurred }) => {
  const isBalance = type === 'balance';
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <View className={`p-6 rounded-4xl border ${
      isBalance 
        ? 'bg-brand-dark dark:bg-black border-brand-dark shadow-xl' 
        : 'bg-white dark:bg-brand-dark/80 border-brand-gray/20 dark:border-brand-dark shadow-sm'
    }`}>
      <View className="flex-row items-center gap-3 mb-3">
        <View className={`p-2.5 rounded-2xl ${
          isBalance ? 'bg-brand-green' : 
          type === 'income' ? 'bg-brand-green/10' : 
          'bg-red-50 dark:bg-red-900/30'
        }`}>
          {isBalance ? (
            <Wallet size={20} color="white" />
          ) : type === 'income' ? (
            <ArrowUpRight size={20} color="#11C76F" />
          ) : (
            <ArrowDownRight size={20} color="#EF4444" />
          )}
        </View>
        <Text className={`text-xs font-bold uppercase tracking-widest ${
          isBalance ? 'text-brand-gray/60' : 'text-brand-dark/50 dark:text-brand-gray/50'
        }`}>
          {label}
        </Text>
      </View>
      <Text className={`text-2xl font-bold tracking-tight ${
        isBalance ? 'text-white' : 'text-brand-dark dark:text-white'
      } ${isBlurred ? 'opacity-20' : ''}`}>
        {value}
      </Text>
    </View>
  );
};

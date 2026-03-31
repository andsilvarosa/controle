import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Bell, Menu, X, AlertCircle, Clock, Sparkles, Eye, EyeOff, Calendar, Moon, Sun } from 'lucide-react-native';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';

export const Header: React.FC = () => {
  const { transactions, user } = useFinanceStore();
  const { theme, toggleTheme, isPrivacyMode, togglePrivacyMode, setMobileMenuOpen } = useUIStore();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const notifications = useMemo(() => {
    const now = new Date();
    const toDateStr = (d: Date) => d.toISOString().split('T')[0];

    const todayStr = toDateStr(now);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrow);

    const limit = new Date(now);
    limit.setDate(limit.getDate() + 3);
    const limitStr = toDateStr(limit);

    return transactions
      .filter(t => !t.isPaid && t.dueDate <= limitStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map(t => {
         let status = { 
             label: 'Próximo ao Vencimento', 
             style: 'bg-blue-50 text-blue-600 border-blue-100', 
             icon: Calendar 
         };

         if (t.dueDate < todayStr) {
             status = { 
                 label: 'Vencido', 
                 style: 'bg-red-50 text-red-600 border-red-100', 
                 icon: AlertCircle 
             };
         } else if (t.dueDate === todayStr) {
             status = { 
                 label: 'Vence Hoje', 
                 style: 'bg-orange-50 text-orange-600 border-orange-100', 
                 icon: Clock 
             };
         } else if (t.dueDate === tomorrowStr) {
             status = { 
                 label: 'Vence Amanhã', 
                 style: 'bg-yellow-50 text-yellow-600 border-yellow-100', 
                 icon: Clock 
             };
         }

         return { ...t, status };
      });
  }, [transactions]);

  return (
    <View className="bg-brand-gray/90 dark:bg-black/90 border-b border-brand-gray/20 dark:border-brand-dark/50 px-6 py-5 flex-row items-center justify-between">
      <View className="flex-row items-center gap-5">
        <TouchableOpacity 
          onPress={() => setMobileMenuOpen(true)}
          className="w-12 h-12 bg-white dark:bg-brand-dark rounded-[18px] items-center justify-center border border-brand-gray/10 dark:border-brand-dark shadow-sm"
        >
          <Menu size={24} color={theme === 'dark' ? '#F5F5F5' : '#000000'} />
        </TouchableOpacity>
        
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-2 h-2 rounded-full bg-brand-green shadow-sm shadow-brand-green/50" />
            <Text className="text-brand-dark/30 dark:text-brand-gray/30 text-[10px] font-black uppercase tracking-[0.4em]">
              SOS Controle
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xl font-black text-brand-dark dark:text-white tracking-tight">
              {greeting}, 
            </Text>
            <Text className="text-xl font-black text-brand-green tracking-tight">
              {user.name.split(' ')[0]}
            </Text>
            <Sparkles size={20} color="#11C76F" fill="#11C76F" />
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5 p-1.5 bg-white/60 dark:bg-brand-dark/60 border border-brand-gray/20 dark:border-brand-dark/50 rounded-[24px] shadow-sm">
        <TouchableOpacity
          onPress={toggleTheme}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          {theme === 'dark' ? <Sun size={20} color="#F5F5F5" /> : <Moon size={20} color="#000000" />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePrivacyMode}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          {isPrivacyMode ? <EyeOff size={20} color={theme === 'dark' ? '#F5F5F5' : '#000000'} /> : <Eye size={20} color={theme === 'dark' ? '#F5F5F5' : '#000000'} />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsNotifOpen(true)}
          className={`w-10 h-10 rounded-full items-center justify-center ${isNotifOpen ? 'bg-brand-green shadow-lg shadow-brand-green/30' : ''}`}
        >
          <Bell size={20} color={isNotifOpen ? 'white' : (theme === 'dark' ? '#F5F5F5' : '#000000')} />
          {notifications.length > 0 && (
            <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-brand-dark rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isNotifOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNotifOpen(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity 
            className="flex-1" 
            onPress={() => setIsNotifOpen(false)} 
          />
          <View className="bg-brand-gray dark:bg-brand-dark rounded-t-[40px] max-h-[80%] border-t border-brand-gray/20 dark:border-brand-dark shadow-2xl">
            <View className="p-8 border-b border-brand-gray/10 dark:border-brand-dark flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-brand-green/10 rounded-xl">
                  <Bell size={20} color="#11C76F" />
                </View>
                <View>
                  <Text className="text-xl font-bold text-brand-dark dark:text-white tracking-tight">Notificações</Text>
                  <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Alertas de Vencimento</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setIsNotifOpen(false)} 
                className="w-10 h-10 bg-white dark:bg-brand-dark/50 rounded-full items-center justify-center border border-brand-gray/20 dark:border-brand-dark"
              >
                <X size={20} color={theme === 'dark' ? '#F5F5F5' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="p-6">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <View key={n.id} className="bg-white dark:bg-brand-dark/50 p-6 rounded-[32px] border border-brand-gray/10 dark:border-brand-dark mb-4 shadow-sm">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-4">
                        <Text className="font-bold text-brand-dark dark:text-white text-base leading-tight">{n.description}</Text>
                        <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest mt-1">Vencimento: {n.dueDate.split('-').reverse().join('/')}</Text>
                      </View>
                      <Text className={`text-lg font-black text-brand-dark dark:text-white ${isPrivacyMode ? 'opacity-20' : ''}`}>
                        R$ {n.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-brand-gray/5 dark:border-brand-dark/20">
                      <View className={`px-3 py-1.5 rounded-xl border ${n.status.style}`}>
                        <Text className="text-[10px] font-bold uppercase tracking-widest">{n.status.label}</Text>
                      </View>
                      <TouchableOpacity className="flex-row items-center gap-1">
                        <Text className="text-brand-green font-bold text-[10px] uppercase tracking-widest">Pagar Agora</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-20 items-center">
                  <View className="w-20 h-20 bg-brand-green/10 rounded-full items-center justify-center mb-6">
                    <Sparkles size={40} color="#11C76F" />
                  </View>
                  <Text className="font-bold text-brand-dark dark:text-white text-lg tracking-tight">Tudo em dia!</Text>
                  <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-bold uppercase tracking-widest text-[10px] mt-1">Nenhuma pendência encontrada</Text>
                </View>
              )}
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

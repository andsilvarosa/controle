import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, Image } from 'react-native';
import { 
  LayoutDashboard, Wallet, PieChart, Settings, LogOut, X, 
  ChevronRight, ShieldCheck, Sparkles, Heart, Target, Zap,
  TrendingUp, TrendingDown, Activity, Droplets, AlertTriangle
} from 'lucide-react-native';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { useRouter, usePathname } from 'expo-router';

export const Sidebar: React.FC = () => {
  const { user, logout, transactions } = useFinanceStore();
  const { isMobileMenuOpen, setMobileMenuOpen, theme } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/(tabs)/dashboard' },
    { id: 'wallets', label: 'Carteiras', icon: Wallet, path: '/(tabs)/wallets' },
    { id: 'reports', label: 'Relatórios', icon: PieChart, path: '/(tabs)/reports' },
    { id: 'settings', label: 'Ajustes', icon: Settings, path: '/(tabs)/settings' },
  ];

  const healthScore = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthT = transactions.filter(t => {
      const d = new Date(t.dueDate + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthT.filter(t => t.type === 'income' && t.isPaid).reduce((acc, t) => acc + t.amount, 0);
    const expense = monthT.filter(t => t.type === 'expense' && t.isPaid).reduce((acc, t) => acc + t.amount, 0);

    if (income === 0) return 0;
    const ratio = (expense / income) * 100;
    return Math.max(0, Math.min(100, 100 - ratio));
  }, [transactions]);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excelente', color: '#11C76F', icon: Sparkles, bg: 'bg-brand-green/10' };
    if (score >= 60) return { label: 'Bom', color: '#11C76F', icon: Activity, bg: 'bg-brand-green/5' };
    if (score >= 40) return { label: 'Atenção', color: '#F97316', icon: AlertTriangle, bg: 'bg-orange-50' };
    return { label: 'Crítico', color: '#EF4444', icon: Zap, bg: 'bg-red-50' };
  };

  const status = getHealthStatus(healthScore);

  const handleNavigate = (path: string) => {
    router.push(path as any);
    setMobileMenuOpen(false);
  };

  return (
    <Modal
      visible={isMobileMenuOpen}
      transparent
      animationType="none"
      onRequestClose={() => setMobileMenuOpen(false)}
    >
      <View className="flex-1 flex-row">
        <SafeAreaView className="w-80 bg-brand-gray dark:bg-black h-full border-r border-brand-gray/20 dark:border-brand-dark/50">
          <View className="p-8 flex-row items-center justify-between border-b border-brand-gray/10 dark:border-brand-dark/50">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-brand-green rounded-[20px] items-center justify-center shadow-2xl shadow-brand-green/40">
                <ShieldCheck size={28} color="white" />
              </View>
              <View>
                <Text className="text-brand-dark dark:text-white font-black text-2xl tracking-tighter">SOS</Text>
                <Text className="text-brand-green font-black text-[10px] uppercase tracking-[0.4em] -mt-1.5">Controle</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setMobileMenuOpen(false)}
              className="w-12 h-12 bg-white dark:bg-brand-dark rounded-[20px] items-center justify-center border border-brand-gray/10 dark:border-brand-dark shadow-sm"
            >
              <X size={24} color={isDark ? '#F5F5F5' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-8">
            {/* Perfil */}
            <View className="bg-white dark:bg-brand-dark p-8 rounded-[50px] border border-brand-gray/10 dark:border-brand-dark/50 mb-10 shadow-sm">
              <View className="flex-row items-center gap-5 mb-8">
                <View className="w-20 h-20 bg-brand-gray dark:bg-brand-dark/50 rounded-[24px] items-center justify-center border border-brand-gray/20 dark:border-brand-dark">
                  <Text className="text-brand-dark dark:text-white font-black text-3xl">
                    {user.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-brand-dark dark:text-white font-black text-xl tracking-tight" numberOfLines={1}>
                    {user.name}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-sm shadow-brand-green/50" />
                    <Text className="text-brand-dark/30 dark:text-brand-gray/30 text-[10px] font-bold uppercase tracking-[0.3em]">
                      Plano Premium
                    </Text>
                  </View>
                </View>
              </View>

              {/* Health Score */}
              <View className={`${status.bg} p-6 rounded-[32px] border border-brand-gray/10 dark:border-brand-dark/50`}>
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center gap-2.5">
                    <status.icon size={18} color={status.color} />
                    <Text className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: status.color }}>
                      Saúde Financeira
                    </Text>
                  </View>
                  <Text className="text-sm font-black" style={{ color: status.color }}>{healthScore}%</Text>
                </View>
                <View className="h-3 w-full bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full shadow-sm" 
                    style={{ width: `${healthScore}%`, backgroundColor: status.color }} 
                  />
                </View>
                <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 mt-4 uppercase tracking-[0.2em]">
                  Status: {status.label}
                </Text>
              </View>
            </View>

            {/* Menu */}
            <View className="mb-10">
              <Text className="text-[10px] font-black text-brand-dark/20 dark:text-brand-gray/20 uppercase tracking-[0.4em] ml-8 mb-6">
                Navegação Principal
              </Text>
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleNavigate(item.path)}
                    className={`flex-row items-center justify-between p-6 rounded-[40px] mb-4 ${
                      isActive ? 'bg-brand-green shadow-2xl shadow-brand-green/40' : 'bg-transparent'
                    }`}
                  >
                    <View className="flex-row items-center gap-5">
                      <View className={`w-12 h-12 rounded-[18px] items-center justify-center ${isActive ? 'bg-white/20' : 'bg-white dark:bg-brand-dark/50 border border-brand-gray/10 dark:border-brand-dark shadow-sm'}`}>
                        <item.icon size={24} color={isActive ? 'white' : (isDark ? '#F5F5F5' : '#000000')} />
                      </View>
                      <Text className={`font-black text-base tracking-tight ${isActive ? 'text-white' : 'text-brand-dark dark:text-brand-gray'}`}>
                        {item.label}
                      </Text>
                    </View>
                    {isActive && <ChevronRight size={20} color="white" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Badges / Gamification */}
            <View className="bg-white dark:bg-brand-dark/30 p-8 rounded-[50px] border border-brand-gray/10 dark:border-brand-dark/50 mb-12 shadow-sm">
               <Text className="text-[10px] font-black text-brand-dark/20 dark:text-brand-gray/20 uppercase tracking-[0.4em] mb-6">
                 Suas Conquistas
               </Text>
               <View className="flex-row flex-wrap gap-5">
                  <View className="w-14 h-14 bg-brand-green/10 rounded-[20px] items-center justify-center border border-brand-green/20">
                    <Sparkles size={24} color="#11C76F" />
                  </View>
                  <View className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-[20px] items-center justify-center border border-blue-100 dark:border-blue-800">
                    <Target size={24} color="#3B82F6" />
                  </View>
                  <View className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-[20px] items-center justify-center border border-purple-100 dark:border-purple-800">
                    <Zap size={24} color="#A855F7" />
                  </View>
                  <View className="w-14 h-14 bg-brand-gray dark:bg-brand-dark/50 rounded-[20px] items-center justify-center border border-brand-gray/20 dark:border-brand-dark opacity-30">
                    <Heart size={24} color="#94a3b8" />
                  </View>
               </View>
            </View>
          </ScrollView>

          <View className="p-8 border-t border-brand-gray/10 dark:border-brand-dark/50">
            <TouchableOpacity 
              onPress={logout}
              className="flex-row items-center gap-5 p-6 bg-red-50 dark:bg-red-900/20 rounded-[35px] border border-red-100 dark:border-red-900/30 shadow-sm"
            >
              <LogOut size={24} color="#EF4444" />
              <Text className="text-red-600 font-black text-base tracking-tight">Sair da Conta</Text>
            </TouchableOpacity>
            <Text className="text-[10px] text-center text-brand-dark/20 dark:text-brand-gray/20 font-black uppercase tracking-[0.4em] mt-6">
              Versão 2.5.0 • SOS Controle
            </Text>
          </View>
        </SafeAreaView>
        <TouchableOpacity 
          className="flex-1 bg-black/40" 
          onPress={() => setMobileMenuOpen(false)} 
        />
      </View>
    </Modal>
  );
};

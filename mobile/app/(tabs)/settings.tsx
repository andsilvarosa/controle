import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { useUIStore } from "../../src/store/useUIStore";
import { 
  LogOut, User, Moon, Sun, ChevronRight, Shield, Bell, 
  LayoutGrid, ListFilter, Target, Sparkles, ShieldCheck,
  Eye, EyeOff, Smartphone, Info, HelpCircle, Share2,
  Settings as SettingsIcon
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Header } from "../../src/components/Layout/Header";

export default function Settings() {
  const { user, logout, setActiveModal } = useFinanceStore();
  const { theme, toggleTheme, isPrivacyMode, togglePrivacyMode } = useUIStore();
  const router = useRouter();
  const isDark = theme === 'dark';

  const settingsItems = [
    { icon: User, label: "Perfil do Usuário", color: "#3b82f6", action: () => setActiveModal('profile') },
    { icon: Bell, label: "Notificações Push", color: "#f59e0b", action: () => {} },
    { icon: Shield, label: "Segurança & PIN", color: "#10b981", action: () => setActiveModal('security') },
  ];

  const manageItems = [
    { icon: LayoutGrid, label: "Categorias", color: "#8b5cf6", action: () => router.push('/categories') },
    { icon: ListFilter, label: "Regras de Importação", color: "#ec4899", action: () => router.push('/rules') },
    { icon: Target, label: "Orçamentos", color: "#10b981", action: () => router.push('/budgets') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-gray dark:bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 py-6">
        <View className="flex-row items-center gap-5 mb-12 px-4">
          <View className="w-16 h-16 bg-brand-green/10 rounded-[24px] items-center justify-center border border-brand-green/20">
            <SettingsIcon size={32} color="#11C76F" />
          </View>
          <View>
            <Text className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Ajustes</Text>
            <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em]">Configurações do App</Text>
          </View>
        </View>

        {/* Perfil Card */}
        <View className="bg-white dark:bg-brand-dark p-12 rounded-[60px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-2xl shadow-black/5 mb-12 items-center">
          <View className="w-32 h-32 bg-brand-gray dark:bg-brand-dark/50 rounded-[48px] items-center justify-center mb-8 border border-brand-gray/20 dark:border-brand-dark overflow-hidden shadow-2xl shadow-black/10">
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-brand-dark dark:text-white font-black text-5xl">{user.name.charAt(0)}</Text>
            )}
          </View>
          <Text className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter">{user.name}</Text>
          <View className="flex-row items-center gap-3 mt-3 bg-brand-gray/50 dark:bg-brand-dark/50 px-6 py-2 rounded-full border border-brand-gray/10 dark:border-brand-dark">
             <ShieldCheck size={16} color="#11C76F" />
             <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-black text-[10px] uppercase tracking-[0.2em]">{user.email}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => setActiveModal('profile')}
            className="mt-10 px-10 py-5 bg-brand-dark dark:bg-brand-dark/50 rounded-[24px] border border-brand-dark/10 dark:border-brand-dark shadow-2xl shadow-black/20"
          >
             <Text className="text-white dark:text-brand-gray font-black text-[10px] uppercase tracking-[0.3em]">Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Preferências */}
        <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em] ml-8 mb-6">Preferências de Interface</Text>
        <View className="bg-white dark:bg-brand-dark rounded-[50px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm mb-12 overflow-hidden">
          <TouchableOpacity
            onPress={toggleTheme}
            className="flex-row items-center p-8 border-b border-brand-gray/5 dark:border-brand-dark/30"
          >
            <View className="w-14 h-14 bg-brand-gray dark:bg-brand-dark/50 rounded-[20px] items-center justify-center mr-6 border border-brand-gray/10 dark:border-brand-dark">
              {isDark ? <Sun size={24} color="#F5F5F5" /> : <Moon size={24} color="#000000" />}
            </View>
            <View className="flex-1">
              <Text className="text-brand-dark dark:text-white font-black text-lg tracking-tight">Modo Escuro</Text>
              <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest mt-1">Alterar aparência visual</Text>
            </View>
            <View className={`w-16 h-9 rounded-full p-1.5 ${isDark ? 'bg-brand-green' : 'bg-brand-gray'}`}>
                <View className={`w-6 h-6 bg-white rounded-full ${isDark ? 'translate-x-7' : ''} shadow-sm`} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePrivacyMode}
            className="flex-row items-center p-8"
          >
            <View className="w-14 h-14 bg-brand-gray dark:bg-brand-dark/50 rounded-[20px] items-center justify-center mr-6 border border-brand-gray/10 dark:border-brand-dark">
              {isPrivacyMode ? <EyeOff size={24} color={isDark ? '#F5F5F5' : '#000000'} /> : <Eye size={24} color={isDark ? '#F5F5F5' : '#000000'} />}
            </View>
            <View className="flex-1">
              <Text className="text-brand-dark dark:text-white font-black text-lg tracking-tight">Modo Privacidade</Text>
              <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest mt-1">Ocultar valores sensíveis</Text>
            </View>
            <View className={`w-16 h-9 rounded-full p-1.5 ${isPrivacyMode ? 'bg-brand-green' : 'bg-brand-gray'}`}>
                <View className={`w-6 h-6 bg-white rounded-full ${isPrivacyMode ? 'translate-x-7' : ''} shadow-sm`} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Gerenciamento */}
        <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em] ml-8 mb-6">Gerenciamento</Text>
        <View className="bg-white dark:bg-brand-dark rounded-[50px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm mb-12 overflow-hidden">
          {manageItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action}
              className={`flex-row items-center p-8 ${
                index !== manageItems.length - 1 ? "border-b border-brand-gray/5 dark:border-brand-dark/30" : ""
              }`}
            >
              <View
                className="w-14 h-14 rounded-[20px] items-center justify-center mr-6 border border-brand-gray/5 dark:border-brand-dark/20"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <item.icon size={24} color={item.color} />
              </View>
              <Text className="flex-1 text-brand-dark dark:text-white font-black text-lg tracking-tight">{item.label}</Text>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Suporte */}
        <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em] ml-8 mb-6">Suporte & Info</Text>
        <View className="bg-white dark:bg-brand-dark rounded-[50px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm mb-16 overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-8 border-b border-brand-gray/5 dark:border-brand-dark/30">
            <View className="w-14 h-14 bg-brand-gray dark:bg-brand-dark/50 rounded-[20px] items-center justify-center mr-6 border border-brand-gray/10 dark:border-brand-dark">
              <HelpCircle size={24} color={isDark ? '#F5F5F5' : '#000000'} />
            </View>
            <Text className="flex-1 text-brand-dark dark:text-white font-black text-lg tracking-tight">Central de Ajuda</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-8">
            <View className="w-14 h-14 bg-brand-gray dark:bg-brand-dark/50 rounded-[20px] items-center justify-center mr-6 border border-brand-gray/10 dark:border-brand-dark">
              <Share2 size={24} color={isDark ? '#F5F5F5' : '#000000'} />
            </View>
            <Text className="flex-1 text-brand-dark dark:text-white font-black text-lg tracking-tight">Compartilhar App</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={logout}
          className="bg-red-50 dark:bg-red-900/20 p-10 rounded-[50px] flex-row items-center justify-center border border-red-100 dark:border-red-900/30 mb-16 shadow-2xl shadow-red-900/5"
        >
          <LogOut size={28} color="#EF4444" />
          <Text className="text-red-600 font-black ml-5 text-xl tracking-tight">Sair da Conta</Text>
        </TouchableOpacity>

        <View className="items-center mb-16">
           <View className="flex-row items-center gap-3 mb-3">
              <Sparkles size={16} color="#11C76F" />
              <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-black text-[10px] uppercase tracking-[0.4em]">SOS Controle</Text>
           </View>
           <Text className="text-[10px] text-brand-dark/20 dark:text-brand-gray/20 font-bold uppercase tracking-widest">
             Versão 2.5.0 • Build 2026.03.31
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


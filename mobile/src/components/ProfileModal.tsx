import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image, ScrollView, Alert } from 'react-native';
import { X, Camera, User, Mail, Phone, ShieldCheck, ChevronRight, Save } from 'lucide-react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUIStore } from '../store/useUIStore';

export function ProfileModal() {
  const { user, updateUser, activeModal, setActiveModal } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome é obrigatório.");
      return;
    }
    
    setLoading(true);
    try {
      await updateUser({ name, email, phone });
      setActiveModal(null);
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={activeModal === 'profile'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-brand-gray dark:bg-black rounded-t-[50px] h-[90%] border-t border-white/10 dark:border-brand-dark/50">
          {/* Header */}
          <View className="flex-row items-center justify-between px-8 py-8 border-b border-brand-gray/10 dark:border-brand-dark/30">
             <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-brand-green/10 rounded-xl items-center justify-center">
                   <User size={20} color="#11C76F" />
                </View>
                <View>
                   <Text className="text-xl font-black text-brand-dark dark:text-white tracking-tight">Perfil</Text>
                   <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Informações Pessoais</Text>
                </View>
             </View>
             <TouchableOpacity 
               onPress={() => setActiveModal(null)}
               className="w-10 h-10 bg-white dark:bg-brand-dark rounded-full items-center justify-center border border-brand-gray/10 dark:border-brand-dark"
             >
               <X size={20} color={isDark ? '#F5F5F5' : '#000000'} />
             </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-8 py-8">
            {/* Avatar Section */}
            <View className="items-center mb-10">
               <View className="relative">
                  <View className="w-32 h-32 bg-white dark:bg-brand-dark rounded-[40px] items-center justify-center border border-brand-gray/10 dark:border-brand-dark shadow-xl shadow-black/5 overflow-hidden">
                    {user?.avatar ? (
                      <Image source={{ uri: user.avatar }} className="w-full h-full" />
                    ) : (
                      <Text className="text-brand-dark dark:text-white font-black text-5xl">{user?.name?.charAt(0)}</Text>
                    )}
                  </View>
                  <TouchableOpacity className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-green rounded-2xl items-center justify-center border-4 border-brand-gray dark:border-black shadow-lg">
                     <Camera size={20} color="white" />
                  </TouchableOpacity>
               </View>
               <Text className="mt-6 text-brand-dark/40 dark:text-brand-gray/40 font-bold text-[10px] uppercase tracking-[0.3em]">Toque para alterar foto</Text>
            </View>

            {/* Form */}
            <View className="space-y-6">
               <View>
                  <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Nome Completo</Text>
                  <View className="bg-white dark:bg-brand-dark rounded-3xl border border-brand-gray/10 dark:border-brand-dark/50 flex-row items-center px-6 py-5 shadow-sm">
                     <User size={20} color="#94a3b8" />
                     <TextInput
                       value={name}
                       onChangeText={setName}
                       placeholder="Seu nome"
                       placeholderTextColor="#94a3b8"
                       className="flex-1 ml-4 text-brand-dark dark:text-white font-bold text-base"
                     />
                  </View>
               </View>

               <View>
                  <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">E-mail</Text>
                  <View className="bg-white dark:bg-brand-dark rounded-3xl border border-brand-gray/10 dark:border-brand-dark/50 flex-row items-center px-6 py-5 shadow-sm opacity-60">
                     <Mail size={20} color="#94a3b8" />
                     <TextInput
                       value={email}
                       editable={false}
                       className="flex-1 ml-4 text-brand-dark dark:text-white font-bold text-base"
                     />
                  </View>
               </View>

               <View>
                  <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Telefone</Text>
                  <View className="bg-white dark:bg-brand-dark rounded-3xl border border-brand-gray/10 dark:border-brand-dark/50 flex-row items-center px-6 py-5 shadow-sm">
                     <Phone size={20} color="#94a3b8" />
                     <TextInput
                       value={phone}
                       onChangeText={setPhone}
                       placeholder="(00) 00000-0000"
                       placeholderTextColor="#94a3b8"
                       keyboardType="phone-pad"
                       className="flex-1 ml-4 text-brand-dark dark:text-white font-bold text-base"
                     />
                  </View>
               </View>
            </View>

            <View className="mt-12 mb-20">
               <TouchableOpacity 
                 onPress={handleSave}
                 disabled={loading}
                 className="bg-brand-green py-6 rounded-[30px] items-center justify-center shadow-lg shadow-brand-green/20"
               >
                  <View className="flex-row items-center gap-3">
                     <Save size={20} color="white" />
                     <Text className="text-white font-black text-lg tracking-tight">Salvar Alterações</Text>
                  </View>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 onPress={() => setActiveModal(null)}
                 className="mt-4 py-6 rounded-[30px] items-center justify-center border border-brand-gray/20 dark:border-brand-dark"
               >
                  <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-black text-[10px] uppercase tracking-[0.3em]">Cancelar</Text>
               </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

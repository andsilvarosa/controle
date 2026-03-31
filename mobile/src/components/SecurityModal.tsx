import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { X, Shield, Lock, Fingerprint, ChevronRight, Save, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUIStore } from '../store/useUIStore';

export function SecurityModal() {
  const { activeModal, setActiveModal } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSavePin = () => {
    if (newPin !== confirmPin) {
      Alert.alert("Erro", "Os PINs não coincidem.");
      return;
    }
    Alert.alert("Sucesso", "Configurações de segurança atualizadas.");
    setActiveModal(null);
  };

  return (
    <Modal
      visible={activeModal === 'security'}
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
                   <Shield size={20} color="#11C76F" />
                </View>
                <View>
                   <Text className="text-xl font-black text-brand-dark dark:text-white tracking-tight">Segurança</Text>
                   <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Proteção da Conta</Text>
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
            {/* Security Options */}
            <View className="bg-white dark:bg-brand-dark rounded-[40px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm mb-10 overflow-hidden">
               <View className="flex-row items-center p-6 border-b border-brand-gray/5 dark:border-brand-dark/30">
                  <View className="w-12 h-12 bg-brand-gray dark:bg-brand-dark/50 rounded-2xl items-center justify-center mr-5 border border-brand-gray/10 dark:border-brand-dark">
                     <Lock size={22} color="#11C76F" />
                  </View>
                  <View className="flex-1">
                     <Text className="text-brand-dark dark:text-white font-bold text-base tracking-tight">Bloqueio por PIN</Text>
                     <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest mt-0.5">Exigir PIN ao abrir o app</Text>
                  </View>
                  <Switch
                    value={pinEnabled}
                    onValueChange={setPinEnabled}
                    trackColor={{ false: "#e2e8f0", true: "#11C76F" }}
                    thumbColor="#ffffff"
                  />
               </View>

               <View className="flex-row items-center p-6">
                  <View className="w-12 h-12 bg-brand-gray dark:bg-brand-dark/50 rounded-2xl items-center justify-center mr-5 border border-brand-gray/10 dark:border-brand-dark">
                     <Fingerprint size={22} color="#11C76F" />
                  </View>
                  <View className="flex-1">
                     <Text className="text-brand-dark dark:text-white font-bold text-base tracking-tight">Biometria / FaceID</Text>
                     <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest mt-0.5">Acesso rápido e seguro</Text>
                  </View>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={setBiometricEnabled}
                    trackColor={{ false: "#e2e8f0", true: "#11C76F" }}
                    thumbColor="#ffffff"
                  />
               </View>
            </View>

            {/* PIN Change Section */}
            {pinEnabled && (
               <View className="space-y-6">
                  <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-6 mb-5">Configurar PIN</Text>
                  
                  <View>
                     <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">PIN Atual</Text>
                     <View className="bg-white dark:bg-brand-dark rounded-3xl border border-brand-gray/10 dark:border-brand-dark/50 flex-row items-center px-6 py-5 shadow-sm">
                        <Key size={20} color="#94a3b8" />
                        <TextInput
                          value={currentPin}
                          onChangeText={setCurrentPin}
                          placeholder="••••"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          secureTextEntry={!showPin}
                          maxLength={4}
                          className="flex-1 ml-4 text-brand-dark dark:text-white font-bold text-base"
                        />
                        <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                           {showPin ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                        </TouchableOpacity>
                     </View>
                  </View>

                  <View>
                     <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Novo PIN</Text>
                     <View className="bg-white dark:bg-brand-dark rounded-3xl border border-brand-gray/10 dark:border-brand-dark/50 flex-row items-center px-6 py-5 shadow-sm">
                        <Key size={20} color="#94a3b8" />
                        <TextInput
                          value={newPin}
                          onChangeText={setNewPin}
                          placeholder="••••"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          secureTextEntry={!showPin}
                          maxLength={4}
                          className="flex-1 ml-4 text-brand-dark dark:text-white font-bold text-base"
                        />
                     </View>
                  </View>

                  <View>
                     <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Confirmar Novo PIN</Text>
                     <View className="bg-white dark:bg-brand-dark rounded-3xl border border-brand-gray/10 dark:border-brand-dark/50 flex-row items-center px-6 py-5 shadow-sm">
                        <Key size={20} color="#94a3b8" />
                        <TextInput
                          value={confirmPin}
                          onChangeText={setConfirmPin}
                          placeholder="••••"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          secureTextEntry={!showPin}
                          maxLength={4}
                          className="flex-1 ml-4 text-brand-dark dark:text-white font-bold text-base"
                        />
                     </View>
                  </View>
               </View>
            )}

            <View className="mt-12 mb-20">
               <TouchableOpacity 
                 onPress={handleSavePin}
                 className="bg-brand-green py-6 rounded-[30px] items-center justify-center shadow-lg shadow-brand-green/20"
               >
                  <View className="flex-row items-center gap-3">
                     <ShieldCheck size={20} color="white" />
                     <Text className="text-white font-black text-lg tracking-tight">Salvar Configurações</Text>
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

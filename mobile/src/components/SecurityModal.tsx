import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useFinanceStore } from "../store/useFinanceStore";
import { X, Shield, Fingerprint, Lock, Bell } from "lucide-react-native";

export function SecurityModal() {
  const { activeModal, setActiveModal } = useFinanceStore();
  const [biometrics, setBiometrics] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [pin, setPin] = useState(false);

  return (
    <Modal
      visible={activeModal === 'security'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 h-[60%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Segurança e Privacidade</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-6 items-center">
              <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4">
                <Shield size={40} color="#0d9488" />
              </View>
              <Text className="text-gray-500 text-center text-sm px-10">
                Proteja seus dados financeiros com as opções de segurança abaixo.
              </Text>
            </View>

            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                    <Fingerprint size={20} color="#0d9488" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-bold">Biometria</Text>
                    <Text className="text-gray-400 text-xs">Usar FaceID ou Digital</Text>
                  </View>
                </View>
                <Switch 
                  value={biometrics} 
                  onValueChange={setBiometrics}
                  trackColor={{ false: "#d1d5db", true: "#0d9488" }}
                />
              </View>

              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                    <Lock size={20} color="#0d9488" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-bold">PIN de Segurança</Text>
                    <Text className="text-gray-400 text-xs">Exigir senha ao abrir</Text>
                  </View>
                </View>
                <Switch 
                  value={pin} 
                  onValueChange={setPin}
                  trackColor={{ false: "#d1d5db", true: "#0d9488" }}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                    <Bell size={20} color="#0d9488" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-bold">Notificações</Text>
                    <Text className="text-gray-400 text-xs">Alertas de gastos e limites</Text>
                  </View>
                </View>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications}
                  trackColor={{ false: "#d1d5db", true: "#0d9488" }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              className="bg-teal-600 py-4 rounded-2xl items-center shadow-sm"
            >
              <Text className="text-white font-bold text-lg">Concluir</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

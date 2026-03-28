import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useFinanceStore } from "../store/useFinanceStore";
import { X, User, Mail } from "lucide-react-native";

export function ProfileModal() {
  const { activeModal, setActiveModal, user, setUser } = useFinanceStore();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");

  useEffect(() => {
    if (activeModal === 'profile') {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [activeModal, user]);

  const handleSave = () => {
    setUser({ ...user, name, email });
    setActiveModal(null);
  };

  return (
    <Modal
      visible={activeModal === 'profile'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 h-[60%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Editar Perfil</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-6 items-center">
              <View className="w-24 h-24 bg-teal-100 rounded-full items-center justify-center mb-2">
                <User size={48} color="#0d9488" />
              </View>
              <Text className="text-teal-600 font-medium">Alterar Foto</Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-2 font-medium">Nome</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <User size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Seu nome"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-500 text-sm mb-2 font-medium">E-mail</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Mail size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Seu e-mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-teal-600 py-4 rounded-2xl items-center shadow-sm"
            >
              <Text className="text-white font-bold text-lg">Salvar Alterações</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { X, Check } from 'lucide-react-native';
import { TransactionType } from '../types';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b'
];

const ICONS = [
  'Home', 'ShoppingBag', 'Coffee', 'Car', 'Heart', 'Book', 'Briefcase', 'DollarSign', 'Smartphone', 'Tv', 'Plane', 'Utensils', 'Gamepad2', 'Music', 'Dumbbell'
];

export function CategoryModal() {
  const { activeModal, setActiveModal, addCategory, updateCategory, editingCategory, setEditingCategory } = useFinanceStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setType(editingCategory.type);
      setColor(editingCategory.color);
      setIcon(editingCategory.icon);
    } else {
      resetFields();
    }
  }, [editingCategory]);

  const resetFields = () => {
    setName('');
    setType('expense');
    setColor(COLORS[0]);
    setIcon(ICONS[0]);
  };

  const handleSave = async () => {
    if (!name) return;

    const categoryData = {
      id: editingCategory?.id || Math.random().toString(36).substring(2, 9),
      name,
      type,
      color,
      icon,
    };

    if (editingCategory) {
      await updateCategory(categoryData);
    } else {
      await addCategory(categoryData);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    resetFields();
    setEditingCategory(null);
    setActiveModal(null);
  };

  if (activeModal !== 'category') return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={activeModal === 'category'}
      onRequestClose={resetAndClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-3xl p-6"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            <TouchableOpacity onPress={resetAndClose}>
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Nome da Categoria</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-900"
                placeholder="Ex: Alimentação, Lazer, Aluguel..."
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="flex-row mb-6 bg-gray-100 p-1 rounded-xl">
              <TouchableOpacity 
                onPress={() => setType('income')}
                className={`flex-1 py-2 rounded-lg items-center ${type === 'income' ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`font-bold ${type === 'income' ? 'text-green-600' : 'text-gray-500'}`}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setType('expense')}
                className={`flex-1 py-2 rounded-lg items-center ${type === 'expense' ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`font-bold ${type === 'expense' ? 'text-red-600' : 'text-gray-500'}`}>Despesa</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-gray-500 mb-2">Cor</Text>
              <View className="flex-row flex-wrap gap-2">
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    className={`w-10 h-10 rounded-full items-center justify-center`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={20} color="white" />}
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

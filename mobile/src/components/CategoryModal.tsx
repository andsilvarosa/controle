import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUIStore } from '../store/useUIStore';
import { X, Check, Sparkles, LayoutGrid } from 'lucide-react-native';
import { TransactionType } from '../types';

const COLORS = [
  '#11C76F', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#d946ef', '#64748b'
];

const ICONS = [
  'Home', 'ShoppingBag', 'Coffee', 'Car', 'Heart', 'Book', 'Briefcase', 'DollarSign', 'Smartphone', 'Tv', 'Plane', 'Utensils', 'Gamepad2', 'Music', 'Dumbbell'
];

export function CategoryModal() {
  const { activeModal, setActiveModal, addCategory, updateCategory, editingCategory, setEditingCategory } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

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
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-brand-gray dark:bg-black rounded-t-[50px] p-10 border-t border-white/10 dark:border-brand-dark/50 shadow-2xl"
        >
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-brand-green/10 rounded-2xl items-center justify-center border border-brand-green/20">
                <LayoutGrid size={22} color="#11C76F" />
              </View>
              <View>
                <Text className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </Text>
                <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Organização de Gastos</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={resetAndClose}
              className="w-12 h-12 bg-white dark:bg-brand-dark rounded-full items-center justify-center border border-brand-gray/10 dark:border-brand-dark"
            >
              <X size={22} color={isDark ? "#F5F5F5" : "#000000"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[75vh]">
            <View className="mb-8">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-3">Nome da Categoria</Text>
              <TextInput
                className="bg-white dark:bg-brand-dark p-6 rounded-[30px] text-brand-dark dark:text-white font-black text-base border border-brand-gray/10 dark:border-brand-dark shadow-sm"
                placeholder="Ex: Alimentação, Lazer, Aluguel..."
                placeholderTextColor={isDark ? "#4A4A4A" : "#94a3b8"}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="flex-row mb-10 bg-white dark:bg-brand-dark p-2 rounded-[24px] border border-brand-gray/10 dark:border-brand-dark">
              <TouchableOpacity 
                onPress={() => setType('income')}
                className={`flex-1 py-4 rounded-[18px] items-center ${type === 'income' ? 'bg-brand-green shadow-lg shadow-brand-green/20' : ''}`}
              >
                <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${type === 'income' ? 'text-white' : 'text-brand-dark/40 dark:text-brand-gray/40'}`}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setType('expense')}
                className={`flex-1 py-4 rounded-[18px] items-center ${type === 'expense' ? 'bg-red-500 shadow-lg shadow-red-500/20' : ''}`}
              >
                <Text className={`font-black text-[10px] uppercase tracking-[0.2em] ${type === 'expense' ? 'text-white' : 'text-brand-dark/40 dark:text-brand-gray/40'}`}>Despesa</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-10">
              <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] ml-4 mb-5">Cor de Identificação</Text>
              <View className="flex-row flex-wrap gap-4">
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    className={`w-12 h-12 rounded-[18px] items-center justify-center shadow-sm`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={22} color="white" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-brand-green py-8 rounded-[30px] items-center shadow-2xl shadow-brand-green/30 mb-12"
            >
              <Text className="text-white font-black text-lg tracking-tight uppercase">Salvar Categoria</Text>
            </TouchableOpacity>
            
            <View className="h-16" />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { X, Check } from 'lucide-react-native';

export function RuleModal() {
  const { activeModal, setActiveModal, addRule, updateRule, editingRule, setEditingRule, categories } = useFinanceStore();
  const [condition, setCondition] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (editingRule) {
      setCondition(editingRule.condition);
      setCategoryId(editingRule.categoryId);
      setActive(editingRule.active);
    } else {
      resetFields();
      if (categories.length > 0) setCategoryId(categories[0].id);
    }
  }, [editingRule, categories]);

  const resetFields = () => {
    setCondition('');
    setCategoryId('');
    setActive(true);
  };

  const handleSave = async () => {
    if (!condition || !categoryId) return;

    const ruleData = {
      id: editingRule?.id || Math.random().toString(36).substring(2, 9),
      condition,
      categoryId,
      active,
    };

    if (editingRule) {
      await updateRule(ruleData);
    } else {
      await addRule(ruleData);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    resetFields();
    setEditingRule(null);
    setActiveModal(null);
  };

  if (activeModal !== 'rule') return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={activeModal === 'rule'}
      onRequestClose={resetAndClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-3xl p-6"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              {editingRule ? 'Editar Regra' : 'Nova Regra'}
            </Text>
            <TouchableOpacity onPress={resetAndClose}>
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
            <View className="mb-4">
              <Text className="text-gray-500 mb-2">Se a descrição contém:</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-900"
                placeholder="Ex: Uber, Netflix, Mercado..."
                value={condition}
                onChangeText={setCondition}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-500 mb-2">Atribuir a Categoria:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    className={`px-4 py-2 rounded-full border ${categoryId === c.id ? 'bg-teal-600 border-teal-600' : 'border-gray-200'}`}
                  >
                    <Text className={`${categoryId === c.id ? 'text-white' : 'text-gray-600'}`}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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

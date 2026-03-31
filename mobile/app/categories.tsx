import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { useUIStore } from "../src/store/useUIStore";
import { Plus, Pencil, Trash2, ChevronLeft, LayoutGrid, Sparkles } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Header } from "../src/components/Layout/Header";

export default function Categories() {
  const { categories, setActiveModal, setEditingCategory, deleteCategory } = useFinanceStore();
  const { theme } = useUIStore();
  const router = useRouter();
  const isDark = theme === 'dark';

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setActiveModal('category');
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setActiveModal('category');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Categoria",
      "Tem certeza que deseja excluir esta categoria? Isso não removerá as transações vinculadas.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteCategory(id) }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-gray dark:bg-black">
      <Header />
      
      <View className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-8 px-1">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2 bg-white dark:bg-brand-dark rounded-xl border border-brand-gray/10 dark:border-brand-dark/50"
            >
              <ChevronLeft size={20} color={isDark ? "#F5F5F5" : "#000000"} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight">Categorias</Text>
              <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Organização Financeira</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleAdd}
            className="w-12 h-12 bg-brand-green rounded-2xl items-center justify-center shadow-lg shadow-brand-green/20"
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {categories.length === 0 ? (
            <View className="items-center justify-center py-20 bg-white dark:bg-brand-dark rounded-4xl border border-brand-gray/10 dark:border-brand-dark/50">
              <LayoutGrid size={48} color={isDark ? "#F5F5F520" : "#00000010"} />
              <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-bold mt-4 uppercase tracking-widest text-[10px]">Nenhuma categoria cadastrada</Text>
            </View>
          ) : (
            <View className="gap-4 mb-12">
              {categories.map((category) => (
                <View 
                  key={category.id} 
                  className="bg-white dark:bg-brand-dark p-5 rounded-4xl border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm flex-row items-center"
                >
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <LayoutGrid size={20} color={category.color} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-bold text-brand-dark dark:text-white tracking-tight">{category.name}</Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                       <View className={`w-1.5 h-1.5 rounded-full ${category.type === 'income' ? 'bg-brand-green' : 'bg-red-500'}`} />
                       <Text className={`text-[9px] font-bold uppercase tracking-widest ${category.type === 'income' ? 'text-brand-green' : 'text-red-500'}`}>
                         {category.type === 'income' ? 'Receita' : 'Despesa'}
                       </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={() => handleEdit(category)}
                      className="w-10 h-10 bg-brand-gray dark:bg-brand-dark/50 rounded-xl items-center justify-center border border-brand-gray/20 dark:border-brand-dark"
                    >
                      <Pencil size={16} color={isDark ? "#F5F5F5" : "#000000"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDelete(category.id)}
                      className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl items-center justify-center border border-red-100 dark:border-red-900/30"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className="items-center mb-12">
             <View className="flex-row items-center gap-2 mb-2">
                <Sparkles size={14} color="#11C76F" />
                <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-bold text-[10px] uppercase tracking-[0.3em]">SOS Controle</Text>
             </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


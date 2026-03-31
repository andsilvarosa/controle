import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, SafeAreaView } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { useUIStore } from "../src/store/useUIStore";
import { Plus, Pencil, Trash2, ChevronLeft, ListFilter, Sparkles, Info } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Header } from "../src/components/Layout/Header";

export default function Rules() {
  const { rules, setActiveModal, setEditingRule, deleteRule, toggleRule, categories } = useFinanceStore();
  const { theme } = useUIStore();
  const router = useRouter();
  const isDark = theme === 'dark';

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setActiveModal('rule');
  };

  const handleAdd = () => {
    setEditingRule(null);
    setActiveModal('rule');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Regra",
      "Tem certeza que deseja excluir esta regra de categorização automática?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteRule(id) }
      ]
    );
  };

  const getCategory = (id: string) => {
    return categories.find(c => c.id === id);
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
              <Text className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight">Regras</Text>
              <Text className="text-[10px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Automação Inteligente</Text>
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
          <View className="bg-brand-green/5 dark:bg-brand-green/10 p-5 rounded-4xl border border-brand-green/20 dark:border-brand-green/30 mb-8 flex-row items-start gap-4">
            <View className="p-2 bg-brand-green/20 rounded-xl">
              <Info size={18} color="#11C76F" />
            </View>
            <Text className="flex-1 text-brand-dark/60 dark:text-brand-gray/60 text-xs font-medium leading-5">
              Regras ajudam a categorizar automaticamente transações importadas via notificações bancárias com base em palavras-chave.
            </Text>
          </View>

          {rules.length === 0 ? (
            <View className="items-center justify-center py-20 bg-white dark:bg-brand-dark rounded-4xl border border-brand-gray/10 dark:border-brand-dark/50">
              <ListFilter size={48} color={isDark ? "#F5F5F520" : "#00000010"} />
              <Text className="text-brand-dark/40 dark:text-brand-gray/40 font-bold mt-4 uppercase tracking-widest text-[10px]">Nenhuma regra cadastrada</Text>
            </View>
          ) : (
            <View className="gap-4 mb-12">
              {rules.map((rule) => {
                const category = getCategory(rule.categoryId);
                return (
                  <View 
                    key={rule.id} 
                    className="bg-white dark:bg-brand-dark p-5 rounded-4xl border border-brand-gray/10 dark:border-brand-dark/50 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="flex-1 mr-4">
                        <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-widest mb-1">Se contém:</Text>
                        <Text className="text-lg font-bold text-brand-dark dark:text-white tracking-tight">"{rule.condition}"</Text>
                      </View>
                      <Switch 
                        value={rule.active} 
                        onValueChange={() => toggleRule(rule.id)}
                        trackColor={{ false: isDark ? "#1E1E1E" : "#E5E7EB", true: "#11C76F" }}
                        thumbColor="#FFFFFF"
                      />
                    </View>

                    <View className="flex-row items-center justify-between pt-4 border-t border-brand-gray/5 dark:border-brand-dark/30">
                      <View className="flex-row items-center gap-2">
                        <View 
                          className="w-6 h-6 rounded-lg items-center justify-center"
                          style={{ backgroundColor: category ? `${category.color}15` : '#F3F4F6' }}
                        >
                          <View 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category?.color || '#9CA3AF' }}
                          />
                        </View>
                        <Text className="text-brand-dark/60 dark:text-brand-gray/60 text-xs font-bold">
                          {category?.name || 'Sem Categoria'}
                        </Text>
                      </View>

                      <View className="flex-row gap-2">
                        <TouchableOpacity 
                          onPress={() => handleEdit(rule)}
                          className="w-10 h-10 bg-brand-gray dark:bg-brand-dark/50 rounded-xl items-center justify-center border border-brand-gray/20 dark:border-brand-dark"
                        >
                          <Pencil size={16} color={isDark ? "#F5F5F5" : "#000000"} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(rule.id)}
                          className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl items-center justify-center border border-red-100 dark:border-red-900/30"
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
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


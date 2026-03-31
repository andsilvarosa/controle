import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { Plus, Pencil, Trash2, ChevronLeft, ListFilter } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Rules() {
  const { rules, setActiveModal, setEditingRule, deleteRule, toggleRule, categories } = useFinanceStore();
  const router = useRouter();

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
      "Tem certeza que deseja excluir esta regra?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteRule(id) }
      ]
    );
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Sem Categoria';
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-6 pt-12 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Regras</Text>
        <TouchableOpacity 
          onPress={handleAdd}
          className="p-2 bg-brand-green rounded-full"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
          <Text className="text-blue-800 text-sm">
            Regras ajudam a categorizar automaticamente transações importadas via notificações bancárias.
          </Text>
        </View>

        {rules.length === 0 ? (
          <View className="items-center justify-center py-20">
            <ListFilter size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">Nenhuma regra cadastrada.</Text>
          </View>
        ) : (
          rules.map((rule) => (
            <View 
              key={rule.id} 
              className="bg-white p-4 rounded-2xl mb-3 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-gray-900 flex-1">Se contém: "{rule.condition}"</Text>
                <Switch 
                  value={rule.active} 
                  onValueChange={() => toggleRule(rule.id)}
                  trackColor={{ false: "#d1d5db", true: "#11C76F" }}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-gray-600 text-xs">Atribuir a: {getCategoryName(rule.categoryId)}</Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={() => handleEdit(rule)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <Pencil size={18} color="#4b5563" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(rule.id)}
                    className="p-2 bg-red-50 rounded-full"
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

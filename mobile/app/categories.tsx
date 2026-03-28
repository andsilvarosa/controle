import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { Plus, Pencil, Trash2, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Categories() {
  const { categories, setActiveModal, setEditingCategory, deleteCategory } = useFinanceStore();
  const router = useRouter();

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
      "Tem certeza que deseja excluir esta categoria?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteCategory(id) }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-6 pt-12 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Categorias</Text>
        <TouchableOpacity 
          onPress={handleAdd}
          className="p-2 bg-teal-600 rounded-full"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        {categories.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-500">Nenhuma categoria cadastrada.</Text>
          </View>
        ) : (
          categories.map((category) => (
            <View 
              key={category.id} 
              className="bg-white p-4 rounded-2xl mb-3 shadow-sm flex-row items-center border-l-4"
              style={{ borderLeftColor: category.color }}
            >
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{category.name}</Text>
                <Text className={`text-xs font-medium uppercase ${category.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {category.type === 'income' ? 'Receita' : 'Despesa'}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => handleEdit(category)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Pencil size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(category.id)}
                  className="p-2 bg-red-50 rounded-full"
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

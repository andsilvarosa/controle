import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { Plus, Pencil, Trash2, ChevronLeft, Target } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Budgets() {
  const { budgets, categories, setActiveModal, setEditingBudget, deleteBudget, transactions } = useFinanceStore();
  const router = useRouter();

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setActiveModal('budget');
  };

  const handleAdd = () => {
    setEditingBudget(null);
    setActiveModal('budget');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Orçamento",
      "Tem certeza que deseja excluir este orçamento?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteBudget(id) }
      ]
    );
  };

  const getCategory = (id: string) => {
    return categories.find(c => c.id === id);
  };

  const getSpent = (categoryId: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        const d = new Date(t.dueDate);
        return t.categoryId === categoryId && 
               t.type === 'expense' && 
               d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-6 pt-12 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Orçamentos</Text>
        <TouchableOpacity 
          onPress={handleAdd}
          className="p-2 bg-brand-green rounded-full"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        {budgets.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Target size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">Nenhum orçamento cadastrado.</Text>
          </View>
        ) : (
          budgets.map((budget) => {
            const category = getCategory(budget.categoryId);
            const spent = getSpent(budget.categoryId);
            const percent = Math.min(100, (spent / budget.amount) * 100);
            const isExceeded = spent > budget.amount;

            return (
              <View key={budget.id} className="bg-white p-5 rounded-2xl mb-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-lg font-bold text-gray-900">{category?.name || 'Categoria'}</Text>
                    <Text className="text-gray-500 text-xs">Mensal</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleEdit(budget)}>
                      <Pencil size={18} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(budget.id)}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row justify-between items-end mb-2">
                  <View>
                    <Text className="text-gray-400 text-xs">Gasto</Text>
                    <Text className={`text-lg font-bold ${isExceeded ? 'text-red-600' : 'text-brand-green'}`}>
                      R$ {spent.toFixed(2)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-400 text-xs">Limite</Text>
                    <Text className="text-lg font-bold text-gray-700">R$ {budget.amount.toFixed(2)}</Text>
                  </View>
                </View>

                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View 
                    className={`h-full rounded-full ${isExceeded ? 'bg-red-500' : 'bg-brand-green'}`}
                    style={{ width: `${percent}%` }}
                  />
                </View>
                <Text className={`text-right text-xs mt-1 font-medium ${isExceeded ? 'text-red-500' : 'text-gray-400'}`}>
                  {percent.toFixed(0)}% utilizado
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

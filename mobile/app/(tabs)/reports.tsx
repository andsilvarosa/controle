import { View, Text, ScrollView } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react-native";

export default function Reports() {
  const { transactions } = useFinanceStore();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Relatórios</Text>

      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500">
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="#22c55e" />
            <Text className="text-gray-500 text-xs ml-1 font-medium">Receitas</Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">R$ {totalIncome.toFixed(2)}</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
          <View className="flex-row items-center mb-2">
            <TrendingDown size={16} color="#ef4444" />
            <Text className="text-gray-500 text-xs ml-1 font-medium">Despesas</Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">R$ {totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <View className="bg-white p-6 rounded-2xl shadow-sm mb-6 items-center">
        <View className="w-16 h-16 bg-teal-100 rounded-full items-center justify-center mb-4">
          <DollarSign size={32} color="#0d9488" />
        </View>
        <Text className="text-gray-500 text-sm mb-1">Balanço Geral</Text>
        <Text className={`text-3xl font-bold ${balance >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
          R$ {balance.toFixed(2)}
        </Text>
      </View>

      <Text className="text-lg font-bold text-gray-900 mb-4">Resumo por Categoria</Text>
      <View className="bg-white rounded-2xl shadow-sm p-4">
        <Text className="text-gray-500 text-center py-4 italic">
          Gráficos e detalhamento por categoria em breve.
        </Text>
      </View>
    </ScrollView>
  );
}

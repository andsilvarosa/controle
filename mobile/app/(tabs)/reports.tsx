import { View, Text, ScrollView } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3 } from "lucide-react-native";

export default function Reports() {
  const { transactions, categories } = useFinanceStore();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthT = transactions.filter(t => {
    const d = new Date(t.dueDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthT.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthT.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const categorySpending = categories
    .filter(c => c.type === 'expense')
    .map(c => {
      const spent = currentMonthT
        .filter(t => t.categoryId === c.id && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
      return { ...c, spent };
    })
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const maxSpent = Math.max(...categorySpending.map(c => c.spent), 1);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Relatórios</Text>

        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border-l-4 border-brand-green">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#11C76F" />
              <Text className="text-gray-500 text-xs ml-1 font-medium">Receitas</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">R$ {income.toFixed(2)}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
            <View className="flex-row items-center mb-2">
              <TrendingDown size={16} color="#ef4444" />
              <Text className="text-gray-500 text-xs ml-1 font-medium">Despesas</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">R$ {expense.toFixed(2)}</Text>
          </View>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-gray-500 font-bold mb-4">Resumo do Mês</Text>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-400 text-xs">Saldo Líquido</Text>
              <Text className={`text-2xl font-bold ${balance >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </Text>
            </View>
            <View className="w-12 h-12 bg-brand-green/10 rounded-full items-center justify-center">
              <BarChart3 size={24} color="#11C76F" />
            </View>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View 
              className="h-full bg-brand-green" 
              style={{ width: `${income > 0 ? Math.min(100, (expense / income) * 100) : 0}%` }} 
            />
          </View>
          <Text className="text-gray-400 text-xs mt-2">
            Comprometimento da renda: {income > 0 ? ((expense / income) * 100).toFixed(1) : 0}%
          </Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm">
          <Text className="text-gray-500 font-bold mb-6">Gastos por Categoria</Text>
          {categorySpending.length === 0 ? (
            <View className="items-center py-10">
              <PieIcon size={48} color="#9ca3af" />
              <Text className="text-gray-400 mt-4">Nenhum gasto este mês.</Text>
            </View>
          ) : (
            categorySpending.map((c) => (
              <View key={c.id} className="mb-6">
                <View className="flex-row justify-between items-end mb-2">
                  <Text className="text-gray-700 font-medium">{c.name}</Text>
                  <Text className="text-gray-900 font-bold">R$ {c.spent.toFixed(2)}</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full" 
                    style={{ backgroundColor: c.color, width: `${(c.spent / maxSpent) * 100}%` }} 
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

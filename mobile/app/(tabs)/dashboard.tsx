import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { LogOut, Plus, TrendingUp, TrendingDown, User } from "lucide-react-native";

export default function Dashboard() {
  const { user, logout, transactions, setActiveModal, setEditingTransaction } = useFinanceStore();

  const totalBalance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthT = transactions.filter(t => {
    const d = new Date(t.dueDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthT.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthT.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setActiveModal(transaction.type);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-sm">Olá,</Text>
            <Text className="text-2xl font-bold text-gray-900">{user.name || "Usuário"}</Text>
          </View>
          <View className="w-12 h-12 bg-brand-green/10 rounded-full items-center justify-center">
            <User size={24} color="#11C76F" />
          </View>
        </View>

        <View className="bg-brand-green rounded-2xl p-6 mb-4 shadow-lg">
          <Text className="text-white/80 text-sm mb-1">Saldo Total</Text>
          <Text className="text-white text-3xl font-bold">
            R$ {totalBalance.toFixed(2)}
          </Text>
        </View>

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

        <Text className="text-lg font-bold text-gray-900 mb-4">Últimas Transações</Text>
        {transactions.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl items-center justify-center shadow-sm">
            <Text className="text-gray-400 italic">Nenhuma transação encontrada.</Text>
          </View>
        ) : (
          transactions.slice(0, 10).map(t => (
            <TouchableOpacity 
              key={t.id} 
              onPress={() => handleEditTransaction(t)}
              className="bg-white p-4 rounded-xl mb-3 flex-row items-center shadow-sm"
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${t.type === 'income' ? 'bg-brand-green/10' : 'bg-red-100'}`}>
                {t.type === 'income' ? <TrendingUp size={20} color="#11C76F" /> : <TrendingDown size={20} color="#dc2626" />}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">{t.description}</Text>
                <Text className="text-gray-500 text-xs">{new Date(t.date).toLocaleDateString()}</Text>
              </View>
              <Text className={`font-bold ${t.type === 'income' ? 'text-brand-green' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        onPress={() => {
          setEditingTransaction(null);
          setActiveModal('expense');
        }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-brand-green rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { LogOut, Plus } from "lucide-react-native";

export default function Dashboard() {
  const { user, logout, transactions, setActiveModal } = useFinanceStore();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-sm">Olá,</Text>
            <Text className="text-2xl font-bold text-gray-900">{user.name || "Usuário"}</Text>
          </View>
          <TouchableOpacity onPress={logout} className="p-2 bg-gray-200 rounded-full">
            <LogOut size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>

        <View className="bg-teal-600 rounded-2xl p-6 mb-6">
          <Text className="text-teal-100 text-sm mb-1">Saldo Total</Text>
          <Text className="text-white text-3xl font-bold">
            R$ {transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0).toFixed(2)}
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">Últimas Transações</Text>
        {transactions.length === 0 ? (
          <Text className="text-gray-500 text-center py-4">Nenhuma transação encontrada.</Text>
        ) : (
          transactions.slice(0, 10).map(t => (
            <View key={t.id} className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm">
              <View>
                <Text className="text-gray-900 font-medium">{t.description}</Text>
                <Text className="text-gray-500 text-xs">{new Date(t.date).toLocaleDateString()}</Text>
              </View>
              <Text className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        onPress={() => setActiveModal('expense')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-teal-600 rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

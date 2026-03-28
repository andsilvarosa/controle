import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { Wallet as WalletIcon, Plus } from "lucide-react-native";

export default function Wallets() {
  const { wallets } = useFinanceStore();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">Minhas Carteiras</Text>
          <TouchableOpacity className="p-2 bg-teal-600 rounded-full">
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {wallets.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl items-center justify-center shadow-sm">
            <WalletIcon size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-center">
              Você ainda não tem carteiras cadastradas.
            </Text>
          </View>
        ) : (
          wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              className="bg-white p-5 rounded-2xl mb-4 shadow-sm flex-row items-center"
            >
              <View className="w-12 h-12 bg-teal-100 rounded-full items-center justify-center mr-4">
                <WalletIcon size={24} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{wallet.name}</Text>
                <Text className="text-gray-500 text-sm">
                  {wallet.currency || "BRL"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-gray-900">
                  {wallet.currency || "R$"} {wallet.balance.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { LogOut, User, Moon, Sun, ChevronRight, Shield, Bell, LayoutGrid, ListFilter, Target } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Settings() {
  const { user, logout, theme, toggleTheme } = useFinanceStore();
  const router = useRouter();

  const settingsItems = [
    { icon: User, label: "Perfil", color: "#3b82f6", action: () => {} },
    { icon: Bell, label: "Notificações", color: "#f59e0b", action: () => {} },
    { icon: Shield, label: "Segurança", color: "#11C76F", action: () => {} },
  ];

  const manageItems = [
    { icon: LayoutGrid, label: "Categorias", color: "#8b5cf6", action: () => router.push('/categories') },
    { icon: ListFilter, label: "Regras de Importação", color: "#ec4899", action: () => router.push('/rules') },
    { icon: Target, label: "Orçamentos", color: "#11C76F", action: () => router.push('/budgets') },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 bg-white border-b border-gray-100 items-center">
        <View className="w-24 h-24 bg-brand-green/10 rounded-full items-center justify-center mb-4 overflow-hidden">
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} className="w-full h-full" />
          ) : (
            <User size={48} color="#11C76F" />
          )}
        </View>
        <Text className="text-xl font-bold text-gray-900">{user.name || "Usuário"}</Text>
        <Text className="text-gray-500">{user.email}</Text>
      </View>

      <View className="p-4">
        <Text className="text-xs font-bold text-gray-400 uppercase mb-4 ml-2">Geral</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action}
              className={`flex-row items-center p-4 ${
                index !== settingsItems.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon size={18} color={item.color} />
              </View>
              <Text className="flex-1 text-gray-700 font-medium">{item.label}</Text>
              <ChevronRight size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs font-bold text-gray-400 uppercase mt-8 mb-4 ml-2">Gerenciamento</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {manageItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action}
              className={`flex-row items-center p-4 ${
                index !== manageItems.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon size={18} color={item.color} />
              </View>
              <Text className="flex-1 text-gray-700 font-medium">{item.label}</Text>
              <ChevronRight size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs font-bold text-gray-400 uppercase mt-8 mb-4 ml-2">Preferências</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <TouchableOpacity
            onPress={toggleTheme}
            className="flex-row items-center p-4"
          >
            <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3">
              {theme === "dark" ? (
                <Moon size={18} color="#8b5cf6" />
              ) : (
                <Sun size={18} color="#8b5cf6" />
              )}
            </View>
            <Text className="flex-1 text-gray-700 font-medium">Tema Escuro</Text>
            <View className={`w-12 h-6 rounded-full p-1 ${theme === 'dark' ? 'bg-brand-green' : 'bg-gray-200'}`}>
                <View className={`w-4 h-4 bg-white rounded-full ${theme === 'dark' ? 'translate-x-6' : ''}`} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={logout}
          className="mt-10 bg-red-50 p-4 rounded-2xl flex-row items-center justify-center border border-red-100"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-600 font-bold ml-2">Sair da Conta</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs mt-8 mb-10">
          SOS Controle v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

import { View, Text, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { Moon, EyeOff, LogOut, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { isDarkMode, isPrivacyMode, toggleDarkMode, togglePrivacyMode, setToken } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    setToken(null);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 pt-4 pb-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</Text>
      </View>

      <View className="px-4 space-y-6">
        {/* Preferências */}
        <View>
          <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-xs tracking-wider">Preferências</Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                  <Moon size={18} color={isDarkMode ? '#fff' : '#374151'} />
                </View>
                <Text className="text-gray-900 dark:text-white font-medium text-base">Modo Escuro</Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#D1D5DB', true: '#11C76F' }}
                thumbColor="#ffffff"
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                  <EyeOff size={18} color={isDarkMode ? '#fff' : '#374151'} />
                </View>
                <Text className="text-gray-900 dark:text-white font-medium text-base">Modo Privacidade</Text>
              </View>
              <Switch 
                value={isPrivacyMode} 
                onValueChange={togglePrivacyMode}
                trackColor={{ false: '#D1D5DB', true: '#11C76F' }}
                thumbColor="#ffffff"
              />
            </View>

          </View>
        </View>

        {/* Integrações */}
        <View className="mt-6">
          <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-xs tracking-wider">Integrações</Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <Pressable className="flex-row items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Bell size={18} color="#11C76F" />
                </View>
                <View>
                  <Text className="text-gray-900 dark:text-white font-medium text-base">Leitura de Notificações</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">Capturar gastos do banco</Text>
                </View>
              </View>
              <Text className="text-primary font-medium">Ativar</Text>
            </Pressable>
          </View>
        </View>

        {/* Conta */}
        <View className="mt-6">
          <Pressable 
            onPress={handleLogout}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-center justify-center border border-red-100 dark:border-red-900/30 active:opacity-80"
          >
            <LogOut size={20} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 font-bold text-base">Sair da Conta</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

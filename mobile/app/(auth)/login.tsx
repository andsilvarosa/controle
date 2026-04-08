import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { MotiView } from 'moti';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken } = useStore();

  const handleLogin = () => {
    // Mock login
    setToken('mock_jwt_token');
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center px-6">
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        className="items-center mb-10"
      >
        <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-6">
          <Text className="text-white text-3xl font-bold">SOS</Text>
        </View>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Bem-vindo</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
          Acesse sua conta para gerenciar suas finanças.
        </Text>
      </MotiView>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">E-mail</Text>
          <TextInput 
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            placeholder="seu@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View className="mt-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Senha</Text>
          <TextInput 
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
        </View>

        <Pressable 
          onPress={handleLogin}
          className="w-full bg-primary rounded-xl py-4 items-center mt-6 active:opacity-80"
        >
          <Text className="text-white font-bold text-lg">Entrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

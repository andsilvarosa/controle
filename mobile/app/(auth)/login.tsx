import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Wallet } from "lucide-react-native";
import { useState } from "react";
import { useFinanceStore } from "../../src/store/useFinanceStore";

export default function Login() {
  const { login } = useFinanceStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || "Erro ao fazer login");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-teal-600 rounded-full items-center justify-center mb-4">
          <Wallet size={40} color="white" />
        </View>
        <Text className="text-3xl font-bold text-gray-900">SOS Controle</Text>
        <Text className="text-gray-500 mt-2 text-center">
          Seu controle financeiro agora no celular.
        </Text>
      </View>

      <View className="w-full space-y-4">
        <TextInput
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 mt-4"
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        {error ? <Text className="text-red-500 text-sm mt-2">{error}</Text> : null}

        <TouchableOpacity 
          className="bg-teal-600 w-full py-4 rounded-xl items-center mt-6"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

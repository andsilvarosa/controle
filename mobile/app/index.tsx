import { Redirect } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";

export default function Index() {
  const { isReady, isAuthenticated } = useFinanceStore();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Preparando sua sessao...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(tabs)/dashboard" : "/(auth)/login"} />;
}

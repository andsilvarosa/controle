import "react-native-reanimated";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { StatusBar } from "expo-status-bar";
import { ModalManager } from "../src/components/ModalManager";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Mantém a splash screen visível até que o app esteja pronto
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignora erros se já estiver oculto */
});

export default function RootLayout() {
  const { isReady, init } = useFinanceStore();

  useEffect(() => {
    console.log("[RootLayout] Iniciando inicialização do app...");
    const prepare = async () => {
      try {
        await init();
        console.log("[RootLayout] App inicializado com sucesso");
      } catch (err) {
        console.error("[RootLayout] Erro durante a inicialização:", err);
      } finally {
        // Oculta a splash screen quando o app estiver pronto
        console.log("[RootLayout] Ocultando splash screen...");
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    console.log("[RootLayout] App não está pronto, exibindo loader...");
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#11C76F" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  console.log("[RootLayout] App pronto, renderizando stack...");
  try {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" />
          </Stack>
          <ModalManager />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  } catch (err) {
    console.error("[RootLayout] Erro de renderização fatal:", err);
    return (
      <View style={styles.loading}>
        <Text style={{ color: 'red', textAlign: 'center', padding: 20 }}>
          Erro fatal ao carregar o aplicativo. Por favor, reinicie.
          {"\n\n"}
          {String(err)}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
});

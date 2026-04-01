import { Stack } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { StatusBar } from "expo-status-bar";
import { ModalManager } from "../src/components/ModalManager";

export default function RootLayout() {
  const { isReady, init } = useFinanceStore();

  useEffect(() => {
    console.log("[RootLayout] Initializing app...");
    try {
      init()
        .then(() => console.log("[RootLayout] App initialized successfully"))
        .catch((err) => {
          console.error("[RootLayout] Error during init:", err);
        });
    } catch (err) {
      console.error("[RootLayout] Synchronous error in useEffect:", err);
    }
  }, []);

  if (!isReady) {
    console.log("[RootLayout] App not ready, showing loader...");
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#11C76F" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  console.log("[RootLayout] App ready, rendering stack...");
  try {
    return (
      <>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" />
        </Stack>
        <ModalManager />
      </>
    );
  } catch (err) {
    console.error("[RootLayout] Render error:", err);
    return (
      <View style={styles.loading}>
        <Text style={{ color: 'red', textAlign: 'center', padding: 20 }}>
          Erro ao renderizar o aplicativo: {String(err)}
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

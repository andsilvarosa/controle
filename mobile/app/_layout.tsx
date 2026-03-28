import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import { TransactionModal } from "../src/components/TransactionModal";
import { WalletModal } from "../src/components/WalletModal";
import { CategoryModal } from "../src/components/CategoryModal";
import { RuleModal } from "../src/components/RuleModal";
import { BudgetModal } from "../src/components/BudgetModal";
import { ProfileModal } from "../src/components/ProfileModal";
import { SecurityModal } from "../src/components/SecurityModal";
import { RecurrenceActionModal } from "../src/components/RecurrenceActionModal";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isReady, init } = useFinanceStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log("RootLayout: Initializing...");
    init().catch(err => console.error("RootLayout: Init failed", err));
  }, []);

  useEffect(() => {
    if (isReady) {
      console.log("RootLayout: Ready, hiding splash screen");
      SplashScreen.hideAsync().catch(err => console.warn("RootLayout: Failed to hide splash", err));
    }
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    console.log("RootLayout: Auth state check", { isAuthenticated, inAuthGroup, segments });

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Carregando...</Text>
      </View>
    );
  }
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <TransactionModal />
      <WalletModal />
      <CategoryModal />
      <RuleModal />
      <BudgetModal />
      <ProfileModal />
      <SecurityModal />
      <RecurrenceActionModal />
    </>
  );
}

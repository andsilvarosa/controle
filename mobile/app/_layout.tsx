import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
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
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isAuthenticated, isReady, init } = useFinanceStore();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("RootLayout: Iniciando preparação...");
        await init();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && isReady) {
      console.log("RootLayout: App pronto, escondendo splash");
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady, isReady]);

  useEffect(() => {
    if (!isReady || !appIsReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = segments.length === 0;
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && (inAuthGroup || isRoot)) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isReady, appIsReady, segments]);

  if (!isReady || !appIsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Iniciando SOS Controle...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
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

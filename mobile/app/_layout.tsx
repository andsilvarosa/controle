import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { StatusBar } from "expo-status-bar";
import { TransactionModal } from "../src/components/TransactionModal";
import { WalletModal } from "../src/components/WalletModal";
import { CategoryModal } from "../src/components/CategoryModal";
import { RuleModal } from "../src/components/RuleModal";
import { BudgetModal } from "../src/components/BudgetModal";
import { ProfileModal } from "../src/components/ProfileModal";
import { SecurityModal } from "../src/components/SecurityModal";
import { RecurrenceActionModal } from "../src/components/RecurrenceActionModal";
import "../global.css";

export default function RootLayout() {
  const { isAuthenticated, isReady, init } = useFinanceStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isReady, segments]);

  if (!isReady) {
    return null;
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

import { Redirect, Stack } from "expo-router";
import { useFinanceStore } from "../../src/store/useFinanceStore";

export default function AuthLayout() {
  const { isAuthenticated, isReady } = useFinanceStore();

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

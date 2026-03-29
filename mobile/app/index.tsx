import { Redirect } from "expo-router";
import { useFinanceStore } from "../src/store/useFinanceStore";

export default function Index() {
  const { isAuthenticated, isReady } = useFinanceStore();

  if (!isReady) return null;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}

import { Stack } from "expo-router";
import type { ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { useFinanceStore } from "../src/store/useFinanceStore";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { TransactionModal } from "../src/components/TransactionModal";
import { WalletModal } from "../src/components/WalletModal";
import { CategoryModal } from "../src/components/CategoryModal";
import { RuleModal } from "../src/components/RuleModal";
import { BudgetModal } from "../src/components/BudgetModal";
import { ProfileModal } from "../src/components/ProfileModal";
import { SecurityModal } from "../src/components/SecurityModal";
import { RecurrenceActionModal } from "../src/components/RecurrenceActionModal";
import "../global.css";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12, textAlign: 'center' }}>
        Falha ao iniciar o app
      </Text>
      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, textAlign: 'center' }}>
        {error.message || 'Ocorreu um erro inesperado ao carregar a aplicacao.'}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{ backgroundColor: '#0d9488', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '700' }}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const { isReady, init } = useFinanceStore();

  useEffect(() => {
    init().catch((e) => {
      console.warn(e);
    });
  }, []);

  if (!isReady) {
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
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
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

import { Redirect, Tabs } from "expo-router";
import { LayoutDashboard, Wallet, PieChart, Settings } from "lucide-react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { useUIStore } from "../../src/store/useUIStore";
import { Sidebar } from "../../src/components/Layout/Sidebar";
import { View } from "react-native";

export default function TabLayout() {
  const { isAuthenticated, isReady } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1">
      <Sidebar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#000000' : '#F5F5F5',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#1A1A1A' : '#E5E5E5',
            height: 85,
            paddingBottom: 25,
            paddingTop: 12,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: '#11C76F',
          tabBarInactiveTintColor: isDark ? '#4A4A4A' : '#94a3b8',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="wallets"
          options={{
            title: "Carteiras",
            tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Relatórios",
            tabBarIcon: ({ color }) => <PieChart size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Ajustes",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}



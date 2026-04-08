import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { BarChart } from 'react-native-gifted-charts';
import { MotiView } from 'moti';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';

const mockTransactions = [
  { id: '1', desc: 'Mercado', amount: -250.00, date: 'Hoje' },
  { id: '2', desc: 'Salário', amount: 5000.00, date: 'Ontem' },
  { id: '3', desc: 'Netflix', amount: -39.90, date: '05 Abr' },
];

const chartData = [
  { value: 4000, label: 'Jan', frontColor: '#11C76F' },
  { value: 2400, label: 'Fev', frontColor: '#ef4444' },
  { value: 3000, label: 'Mar', frontColor: '#11C76F' },
  { value: 1398, label: 'Abr', frontColor: '#ef4444' },
];

export default function DashboardScreen() {
  const { isPrivacyMode } = useStore();

  const formatCurrency = (val: number) => {
    if (isPrivacyMode) return 'R$ •••••';
    return `R$ ${Math.abs(val).toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">Bem-vindo de volta,</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">João Silva</Text>
          </View>
          <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
            <Text className="text-primary font-bold">JS</Text>
          </View>
        </View>

        {/* Horizontal Carousel for KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary rounded-3xl p-6 w-72 mr-4 shadow-lg shadow-primary/30">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white/80 font-medium">Saldo Total</Text>
              <Wallet size={20} color="#fff" />
            </View>
            <Text className="text-white text-3xl font-bold mb-1">{formatCurrency(12540.50)}</Text>
            <Text className="text-white/80 text-xs">+2.5% este mês</Text>
          </MotiView>

          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100 }} className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-64 mr-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 dark:text-gray-400 font-medium">Receitas</Text>
              <View className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                <ArrowUp size={16} color="#11C76F" />
              </View>
            </View>
            <Text className="text-gray-900 dark:text-white text-2xl font-bold mb-1">{formatCurrency(5000)}</Text>
          </MotiView>
        </ScrollView>

        {/* Chart */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-6">Visão Geral</Text>
          <BarChart
            data={chartData}
            barWidth={22}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="lightgray"
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            isAnimated
          />
        </View>

        {/* Recent Transactions */}
        <View className="flex-1 min-h-[300px]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Recentes</Text>
            <Pressable>
              <Text className="text-primary font-medium">Ver todas</Text>
            </Pressable>
          </View>
          
          <FlashList
            data={mockTransactions}
            estimatedItemSize={70}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <View className="flex-row items-center">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {item.amount > 0 ? <ArrowUp size={20} color="#11C76F" /> : <ArrowDown size={20} color="#ef4444" />}
                  </View>
                  <View>
                    <Text className="text-gray-900 dark:text-white font-medium">{item.desc}</Text>
                    <Text className="text-gray-500 text-xs">{item.date}</Text>
                  </View>
                </View>
                <Text className={`font-bold ${item.amount > 0 ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                  {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

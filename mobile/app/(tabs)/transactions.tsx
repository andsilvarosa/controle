import { View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useRef, useMemo, useCallback } from 'react';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';

const mockTransactions = [
  { id: '1', desc: 'Mercado', amount: -250.00, date: 'Hoje' },
  { id: '2', desc: 'Salário', amount: 5000.00, date: 'Ontem' },
  { id: '3', desc: 'Netflix', amount: -39.90, date: '05 Abr' },
  { id: '4', desc: 'Uber', amount: -25.50, date: '04 Abr' },
  { id: '5', desc: 'Restaurante', amount: -120.00, date: '02 Abr' },
];

export default function TransactionsScreen() {
  const { isPrivacyMode } = useStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const handleOpenPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const formatCurrency = (val: number) => {
    if (isPrivacyMode) return 'R$ •••••';
    return `R$ ${Math.abs(val).toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Transações</Text>
        <Pressable 
          onPress={handleOpenPress}
          className="bg-primary w-10 h-10 rounded-full items-center justify-center active:opacity-80"
        >
          <Plus color="#fff" size={24} />
        </Pressable>
      </View>

      <View className="flex-1 px-4 mt-4">
        <FlashList
          data={mockTransactions}
          estimatedItemSize={70}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
              <View className="flex-row items-center">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${item.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {item.amount > 0 ? <ArrowUp size={24} color="#11C76F" /> : <ArrowDown size={24} color="#ef4444" />}
                </View>
                <View>
                  <Text className="text-gray-900 dark:text-white font-medium text-base">{item.desc}</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">{item.date}</Text>
                </View>
              </View>
              <Text className={`font-bold text-base ${item.amount > 0 ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
              </Text>
            </View>
          )}
        />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#ffffff' }}
      >
        <BottomSheetView className="flex-1 px-6 pt-4">
          <Text className="text-xl font-bold text-gray-900 mb-6">Nova Transação</Text>
          
          <View className="flex-row gap-4 mb-6">
            <Pressable className="flex-1 bg-green-100 py-3 rounded-xl items-center border border-green-500">
              <Text className="text-green-700 font-bold">Receita</Text>
            </Pressable>
            <Pressable className="flex-1 bg-gray-100 py-3 rounded-xl items-center">
              <Text className="text-gray-600 font-bold">Despesa</Text>
            </Pressable>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Descrição</Text>
              <BottomSheetTextInput 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Ex: Supermercado"
              />
            </View>
            <View className="mt-4">
              <Text className="text-gray-700 mb-2 font-medium">Valor</Text>
              <BottomSheetTextInput 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholder="R$ 0,00"
                keyboardType="numeric"
              />
            </View>
            
            <Pressable 
              onPress={() => bottomSheetRef.current?.close()}
              className="w-full bg-primary rounded-xl py-4 items-center mt-8 active:opacity-80"
            >
              <Text className="text-white font-bold text-lg">Salvar Transação</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

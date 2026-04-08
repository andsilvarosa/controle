import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

// This is a bridge to the Android Native Module that implements the NotificationListenerService
const { BankNotificationModule } = NativeModules;
const bankNotificationEmitter = BankNotificationModule ? new NativeEventEmitter(BankNotificationModule) : null;

export interface BankNotification {
  id: string;
  bankName: string;
  amount: number;
  type: 'income' | 'expense';
  title: string;
  text: string;
  timestamp: number;
}

export function useBankNotifications() {
  const [recentNotifications, setRecentNotifications] = useState<BankNotification[]>([]);

  useEffect(() => {
    if (!bankNotificationEmitter) {
      console.warn('BankNotificationModule is not linked. This feature requires a custom dev client or bare workflow.');
      return;
    }

    const subscription = bankNotificationEmitter.addListener(
      'onBankNotificationReceived',
      (notification: BankNotification) => {
        setRecentNotifications((prev) => [notification, ...prev]);
        // Here we could also trigger a local notification or update a global store
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return { recentNotifications };
}

import { useEffect } from 'react';
import { registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { parseBankNotification } from './bankParser';
import { useFinanceStore } from '../store/useFinanceStore';

export interface BankNotificationPlugin {
  startService(): Promise<void>;
  stopService(): Promise<void>;
  checkPermissions(): Promise<{ granted: boolean }>;
  requestPermissions(): Promise<void>;
  addListener(
    eventName: 'onBankNotification',
    listenerFunc: (data: { title: string; text: string; packageName: string }) => void
  ): Promise<any>;
}

const BankNotification = registerPlugin<BankNotificationPlugin>('BankNotification');

export function useBankNotifications() {
  const setPendingBankTransaction = useFinanceStore((state) => state.setPendingBankTransaction);
  const setActiveModal = useFinanceStore((state) => state.setActiveModal);

  useEffect(() => {
    let listener: any;

    const setupListener = async () => {
      try {
        const { granted } = await BankNotification.checkPermissions();
        if (granted) {
          await BankNotification.startService();
          listener = await BankNotification.addListener('onBankNotification', (data) => {
            const parsed = parseBankNotification(data.title, data.text, data.packageName);
            if (parsed) {
              setPendingBankTransaction(parsed);
              setActiveModal(parsed.type === 'income' ? 'income' : 'expense');
            }
          });
        }
      } catch (e) {
        console.error('BankNotification plugin not available or error:', e);
      }
    };

    setupListener();

    // Handle deep links from the local notification
    const appUrlListener = App.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);
      if (url.protocol === 'controle:' && url.hostname === 'add') {
        const title = url.searchParams.get('title') || '';
        const text = url.searchParams.get('text') || '';
        const bank = url.searchParams.get('bank') || '';
        
        if (title && text) {
          const parsed = parseBankNotification(title, text, bank);
          if (parsed) {
            setPendingBankTransaction(parsed);
            setActiveModal(parsed.type === 'income' ? 'income' : 'expense');
          }
        }
      }
    });

    return () => {
      if (listener) {
        listener.remove();
      }
      appUrlListener.then(l => l.remove());
    };
  }, [setPendingBankTransaction, setActiveModal]);

  const requestPermissions = async () => {
    try {
      await BankNotification.requestPermissions();
    } catch (e) {
      console.error('Error requesting permissions:', e);
    }
  };

  return { requestPermissions };
}

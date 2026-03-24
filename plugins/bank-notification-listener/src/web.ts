import { WebPlugin } from '@capacitor/core';
import type { BankNotificationPlugin } from './definitions';

export class BankNotificationWeb extends WebPlugin implements BankNotificationPlugin {
  async checkPermission(): Promise<{ granted: boolean }> {
    console.warn('bank-notification-listener only works on Android.');
    return { granted: false };
  }
  async requestPermission(): Promise<void> {
    console.warn('bank-notification-listener only works on Android.');
  }
  async openNotificationSettings(): Promise<void> {
    console.warn('bank-notification-listener only works on Android.');
  }
}

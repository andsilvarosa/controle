import { registerPlugin } from '@capacitor/core';
import type { BankNotificationPlugin } from './definitions';

const BankNotification = registerPlugin<BankNotificationPlugin>('BankNotification', {
  web: () => import('./web').then(m => new m.BankNotificationWeb()),
});

export * from './definitions';
export { BankNotification };

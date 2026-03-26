import { registerPlugin } from '@capacitor/core';
const BankNotification = registerPlugin('BankNotification', {
    web: () => import('./web').then(m => new m.BankNotificationWeb()),
});
export * from './definitions';
export { BankNotification };
//# sourceMappingURL=index.js.map
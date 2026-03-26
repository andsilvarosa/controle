import { WebPlugin } from '@capacitor/core';
export class BankNotificationWeb extends WebPlugin {
    async checkPermission() {
        console.warn('bank-notification-listener only works on Android.');
        return { granted: false };
    }
    async requestPermission() {
        console.warn('bank-notification-listener only works on Android.');
    }
    async openNotificationSettings() {
        console.warn('bank-notification-listener only works on Android.');
    }
    async getPendingNotifications() {
        return { notifications: [] };
    }
}
//# sourceMappingURL=web.js.map
import { WebPlugin } from '@capacitor/core';
import type { BankNotificationPlugin } from './definitions';
export declare class BankNotificationWeb extends WebPlugin implements BankNotificationPlugin {
    checkPermission(): Promise<{
        granted: boolean;
    }>;
    requestPermission(): Promise<void>;
    openNotificationSettings(): Promise<void>;
    getPendingNotifications(): Promise<{
        notifications: any[];
    }>;
}

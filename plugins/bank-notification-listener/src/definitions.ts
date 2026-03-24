import { PluginListenerHandle } from '@capacitor/core';

export interface BankNotificationPayload {
  title: string;
  text: string;
  packageName: string;
}

export interface BankNotificationPlugin {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<void>;
  openNotificationSettings(): Promise<void>;
  addListener(
    eventName: 'bankNotificationReceived',
    listenerFunc: (payload: BankNotificationPayload) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
}

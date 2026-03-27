package com.sos.controle.teste;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;

@CapacitorPlugin(name = "BankNotification")
public class BankNotificationPlugin extends Plugin {

    private static BankNotificationPlugin instance;
    public static boolean isAppForeground = false;

    @Override
    public void load() {
        instance = this;
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        isAppForeground = true;
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        isAppForeground = false;
    }

    public static BankNotificationPlugin getInstance() {
        return instance;
    }

    @PluginMethod
    public void startService(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), ForegroundMonitorService.class);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            getContext().startForegroundService(serviceIntent);
        } else {
            getContext().startService(serviceIntent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), ForegroundMonitorService.class);
        getContext().stopService(serviceIntent);
        call.resolve();
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        String enabledListeners = Settings.Secure.getString(getContext().getContentResolver(), "enabled_notification_listeners");
        String packageName = getContext().getPackageName();
        boolean isGranted = !TextUtils.isEmpty(enabledListeners) && enabledListeners.contains(packageName);
        
        JSObject ret = new JSObject();
        ret.put("granted", isGranted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    public void sendNotificationEvent(String title, String text, String packageName) {
        JSObject ret = new JSObject();
        ret.put("title", title);
        ret.put("text", text);
        ret.put("packageName", packageName);
        notifyListeners("onBankNotification", ret);
    }
}

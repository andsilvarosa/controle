package com.sos.banknotificationlistener;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Settings;
import android.text.TextUtils;
import android.content.SharedPreferences;
import org.json.JSONArray;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BankNotification")
public class BankNotificationPlugin extends Plugin {

    private BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String packageName = intent.getStringExtra("packageName");
            String title = intent.getStringExtra("title");
            String text = intent.getStringExtra("text");

            JSObject data = new JSObject();
            data.put("packageName", packageName);
            data.put("title", title);
            data.put("text", text);

            notifyListeners("bankNotificationReceived", data);
        }
    };

    @Override
    public void load() {
        super.load();
        IntentFilter filter = new IntentFilter(BankNotificationListenerService.ACTION_BANK_NOTIFICATION);
        LocalBroadcastManager.getInstance(getContext()).registerReceiver(receiver, filter);
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        LocalBroadcastManager.getInstance(getContext()).unregisterReceiver(receiver);
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        boolean granted = isNotificationServiceEnabled();
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (!isNotificationServiceEnabled()) {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void getPendingNotifications(PluginCall call) {
        try {
            SharedPreferences prefs = getContext().getSharedPreferences("BankNotifications", Context.MODE_PRIVATE);
            String pendingStr = prefs.getString("pending_list", "[]");
            JSArray arr = new JSArray(pendingStr);
            
            JSObject ret = new JSObject();
            ret.put("notifications", arr);
            call.resolve(ret);
            
            prefs.edit().putString("pending_list", "[]").apply();
        } catch (Exception e) {
            call.reject("Erro ao recuperar notificacoes", e);
        }
    }

    private boolean isNotificationServiceEnabled() {
        String pkgName = getContext().getPackageName();
        final String flat = Settings.Secure.getString(getContext().getContentResolver(),
                "enabled_notification_listeners");
        if (!TextUtils.isEmpty(flat)) {
            final String[] names = flat.split(":");
            for (String name : names) {
                final ComponentName cn = ComponentName.unflattenFromString(name);
                if (cn != null) {
                    if (TextUtils.equals(pkgName, cn.getPackageName())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

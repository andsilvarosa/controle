package com.sos.banknotificationlistener;

import android.app.Notification;
import android.content.Intent;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;

public class BankNotificationListenerService extends NotificationListenerService {

    public static final String ACTION_BANK_NOTIFICATION = "com.sos.controle.ACTION_BANK_NOTIFICATION";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        
        // Vamos capturar de qualquer app por enquanto ou podemos filtrar
        // A lógica de Regex ficará no JS, então só repassamos pra lá.
        
        Notification notification = sbn.getNotification();
        Bundle extras = notification.extras;

        CharSequence titleChar = extras.getCharSequence(Notification.EXTRA_TITLE);
        String title = titleChar != null ? titleChar.toString() : "";
        CharSequence textChar = extras.getCharSequence(Notification.EXTRA_TEXT);
        String text = textChar != null ? textChar.toString() : "";

        // Se tiver texto ou título, mandamos o broadcast local
        if (!title.isEmpty() || !text.isEmpty()) {
            Intent intent = new Intent(ACTION_BANK_NOTIFICATION);
            intent.putExtra("packageName", packageName);
            intent.putExtra("title", title);
            intent.putExtra("text", text);
            LocalBroadcastManager.getInstance(this).sendBroadcast(intent);

            // Salvar no buffer nativo para leitura offline
            try {
                SharedPreferences prefs = getSharedPreferences("BankNotifications", Context.MODE_PRIVATE);
                String pending = prefs.getString("pending_list", "[]");
                JSONArray arr = new JSONArray(pending);
                JSONObject obj = new JSONObject();
                obj.put("packageName", packageName);
                obj.put("title", title);
                obj.put("text", text);
                arr.put(obj);
                prefs.edit().putString("pending_list", arr.toString()).apply();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Não precisamos fazer nada ao remover a notificação
    }
}

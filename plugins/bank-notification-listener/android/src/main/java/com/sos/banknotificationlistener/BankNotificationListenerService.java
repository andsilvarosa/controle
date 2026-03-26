package com.sos.banknotificationlistener;

import android.app.Notification;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
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
        CharSequence bigTextChar = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        CharSequence subTextChar = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);

        StringBuilder fullText = new StringBuilder();
        if (textChar != null) fullText.append(textChar.toString()).append("\n");
        if (bigTextChar != null) fullText.append(bigTextChar.toString()).append("\n");
        if (subTextChar != null) fullText.append(subTextChar.toString()).append("\n");

        String text = fullText.toString().trim();

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
                JSONArray arr;
                try {
                    arr = new JSONArray(pending);
                } catch (Exception e) {
                    arr = new JSONArray(); // Recupera de JSON corrompido
                }
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

    /**
     * Chamado quando o Android desconecta o serviço (ex: economia de bateria).
     * Solicita reconexão automática para que não perca notificações.
     */
    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            requestRebind(new ComponentName(this, BankNotificationListenerService.class));
        }
    }
}

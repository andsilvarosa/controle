package com.sos.banknotificationlistener;

import android.app.Notification;
import android.content.Intent;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

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
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Não precisamos fazer nada ao remover a notificação
    }
}

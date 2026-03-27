package com.sos.controle.teste;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotificationActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if ("ACTION_IGNORE".equals(intent.getAction())) {
            int notificationId = intent.getIntExtra("notification_id", -1);
            if (notificationId != -1) {
                NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                manager.cancel(notificationId);
            }
        }
    }
}

package com.sos.controle.teste;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import java.util.Arrays;
import java.util.List;

public class BankNotificationListenerService extends NotificationListenerService {

    private static final String TAG = "BankNotifListener";
    private static final List<String> TARGET_PACKAGES = Arrays.asList(
            "com.nu.production",
            "com.itau",
            "br.com.intermedium",
            "com.bradesco",
            "com.santander.app"
    );

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        if (TARGET_PACKAGES.contains(packageName)) {
            Notification notification = sbn.getNotification();
            Bundle extras = notification.extras;
            
            String title = extras.getString(Notification.EXTRA_TITLE);
            CharSequence textCharSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
            String text = textCharSeq != null ? textCharSeq.toString() : "";

            if (title != null && !text.isEmpty()) {
                Log.d(TAG, "Intercepted: " + title + " - " + text);
                
                if (BankNotificationPlugin.isAppForeground && BankNotificationPlugin.getInstance() != null) {
                    BankNotificationPlugin.getInstance().sendNotificationEvent(title, text, packageName);
                } else {
                    showLocalNotification(title, text, packageName);
                }
            }
        }
    }

    private void showLocalNotification(String originalTitle, String originalText, String packageName) {
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        String channelId = "bank_alerts_channel";

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "Alertas de Despesas",
                    NotificationManager.IMPORTANCE_HIGH
            );
            notificationManager.createNotificationChannel(channel);
        }

        Intent registerIntent = new Intent(this, MainActivity.class);
        registerIntent.setAction(Intent.ACTION_VIEW);
        String uriStr = "controle://add?title=" + android.net.Uri.encode(originalTitle) 
                        + "&text=" + android.net.Uri.encode(originalText)
                        + "&bank=" + android.net.Uri.encode(packageName);
        registerIntent.setData(android.net.Uri.parse(uriStr));
        registerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent registerPendingIntent = PendingIntent.getActivity(
                this, 
                (int) System.currentTimeMillis(), 
                registerIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent ignoreIntent = new Intent(this, NotificationActionReceiver.class);
        ignoreIntent.setAction("ACTION_IGNORE");
        int notificationId = (int) System.currentTimeMillis();
        ignoreIntent.putExtra("notification_id", notificationId);
        PendingIntent ignorePendingIntent = PendingIntent.getBroadcast(
                this, 
                notificationId, 
                ignoreIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("Nova Despesa Detectada")
                .setContentText(originalTitle + ": " + originalText)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(registerPendingIntent);

        notificationManager.notify(notificationId, builder.build());
    }
}

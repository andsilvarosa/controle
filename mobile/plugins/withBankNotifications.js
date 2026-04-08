const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withBankNotifications(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add Notification Listener Service
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    mainApplication.service.push({
      $: {
        'android:name': '.BankNotificationListenerService',
        'android:label': 'SOS Controle Bank Listener',
        'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': 'android.service.notification.NotificationListenerService',
              },
            },
          ],
        },
      ],
    });

    return config;
  });
};

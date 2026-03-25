import React, { useEffect, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { BankNotification } from 'bank-notification-listener';
import { parseBankNotification, ParsedBankNotification } from '../lib/notificationRegexBuilder';
import { AutoTransactionModal } from './AutoTransactionModal';
import { App } from '@capacitor/app';

export function NotificationManager() {
  const [detectedTransaction, setDetectedTransaction] = useState<ParsedBankNotification | null>(null);
  const [needsSystemPermission, setNeedsSystemPermission] = useState(false);

  useEffect(() => {
    let listenerRef: any = null;

    const setupListener = async () => {
      try {
        // Pede permissão do Android de Local Notifications
        await LocalNotifications.requestPermissions();
        
        // Verifica permissão especial de Leitura de Notificações
        try {
          const perm = await BankNotification.checkPermission();
          if (!perm.granted) {
            setNeedsSystemPermission(true);
            return; // Esperar o usuário dar a permissão
          }
        } catch (err) {
          console.warn("Plugin nativo não disponível ou indisponível na web.");
        }
        
        // Previne a tela de permissão caso já tenha sido concedida
        setNeedsSystemPermission(false);

        // -- PROCESSAR FILA OFFLINE --
        // Verifica se houve alguma notificação enviada pelo banco enquanto o App estava fechado.
        try {
          const missed = await BankNotification.getPendingNotifications();
          if (missed && missed.notifications && missed.notifications.length > 0) {
             missed.notifications.forEach((payload: any) => {
                const parsed = parseBankNotification(payload.packageName, payload.title, payload.text);
                if (parsed) {
                   LocalNotifications.schedule({
                      notifications: [
                        {
                          title: 'Lançamento Retido Detectado',
                          body: `Deseja registrar R$ ${parsed.amount} no ${parsed.bankName}? Tocar para confirmar.`,
                          id: Math.floor(new Date().getTime() + Math.random() * 10000),
                          schedule: { at: new Date(Date.now() + 1000) },
                          extra: parsed
                        }
                      ]
                   });
                }
             });
          }
        } catch (e) {
          console.warn("Fila offline (Background) vazia ou indisponível.", e);
        }

        // Setup the Local Android plugin to receive updates em TEMPO REAL
        listenerRef = await BankNotification.addListener('bankNotificationReceived', (payload) => {
          const parsed = parseBankNotification(payload.packageName, payload.title, payload.text);
          if (parsed) {
             console.log("Notificação detectada do banco:", parsed);
             
             // Disparar uma Themed Local Notification
             LocalNotifications.schedule({
                notifications: [
                  {
                    title: 'Lançamento Detectado',
                    body: `Deseja registrar R$ ${parsed.amount} no ${parsed.bankName}? Tocar para confirmar.`,
                    id: new Date().getTime(),
                    schedule: { at: new Date(Date.now() + 1000) },
                    extra: parsed // Pass the parsed data back through the payload
                  }
                ]
             });
          }
        });
        
        // Listen to Local Notification Clicks
        LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
           console.log("Local Notif Clicada: ", notificationAction);
           const extras = notificationAction.notification.extra as ParsedBankNotification;
           if (extras && extras.bankName) {
              // Open modal inside the app
              setDetectedTransaction(extras);
           }
        });
        
      } catch (err) {
         console.log("Erro ao inicializar NotificationManager:", err);
      }
    };
    
    setupListener();

    // Re-checar permissões quando o app voltar de segundo plano (ex: fechou as configurações)
    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive && needsSystemPermission) {
        setupListener();
      }
    });

    return () => {
       if (listenerRef && typeof listenerRef.remove === 'function') {
         listenerRef.remove();
       }
       appStateListener.then(l => l.remove());
    };
  }, [needsSystemPermission]);
  
  const handleOpenSettings = async () => {
    try {
      await BankNotification.requestPermission();
    } catch (e) {
      console.log(e);
    }
  };

  return (
     <>
       <AutoTransactionModal 
         isOpen={!!detectedTransaction}
         onClose={() => setDetectedTransaction(null)}
         bankName={detectedTransaction?.bankName || ''}
         amount={detectedTransaction?.amount || 0}
         type={detectedTransaction?.type || 'expense'}
       />

       {needsSystemPermission && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95">
             <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
             </div>
             
             <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
               Acesso a Notificações
             </h2>
             
             <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
               Para que o SOS Controle capture automaticamente seus gastos no cartão e Pix, 
               precisamos de acesso à leitura das notificações.
               <br/><br/>
               Você será redirecionado para as configurações do Android. Por favor, ative a chave para o <b>SOS Controle</b>.
             </p>
             
             <div className="flex gap-3">
               <button 
                 onClick={() => setNeedsSystemPermission(false)}
                 className="flex-1 py-3 px-4 font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 rounded-xl transition-colors"
               >
                 Agora Não
               </button>
               <button 
                 onClick={handleOpenSettings}
                 className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors shadow-lg shadow-teal-500/30"
               >
                 Dar Permissão
               </button>
             </div>
           </div>
         </div>
       )}
     </>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface PwaInstallPromptProps {
  show: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  show,
  onInstall,
  onDismiss
}) => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const handleClick = () => {
    if (isIOS) {
      onDismiss();
      return;
    }
    onInstall();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="relative bg-gradient-to-r from-teal-500 to-emerald-500 p-4">
              <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Monitor size={24} className="text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-lg">Instalar SOS Controle</h3>
                  <p className="text-sm text-white/80">
                    {isIOS ? 'Adicione à tela de início' : 'Adicione à tela inicial'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Smartphone size={16} className="text-teal-500" />
                  <span className="text-sm">Acesso rápido pela tela inicial</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                  <span className="text-sm">Funciona offline</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                  <span className="text-sm">Notificações push</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onDismiss}
                  className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Agora não
                </button>
                <button
                  onClick={handleClick}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
                >
                  <Download size={18} />
                  {isIOS ? 'Ver como fazer' : 'Instalar'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
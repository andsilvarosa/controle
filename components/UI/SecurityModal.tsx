
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert, Construction, Loader2, QrCode, Smartphone, Unlock, Lock } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import QRCode from 'qrcode';

export const SecurityModal: React.FC = () => {
  const { activeModal, setActiveModal, updatePassword, generate2FA, enable2FA, disable2FA, is2FAEnabled } = useFinanceStore();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA Setup States
  const [setupStep, setSetupStep] = useState<0 | 1 | 2>(0); // 0: Info, 1: QR, 2: Confirm
  const [qrData, setQrData] = useState<{secret: string, qrCodeImg: string} | null>(null);
  const [otpToken, setOtpToken] = useState('');
  const [disablePassword, setDisablePassword] = useState('');

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (activeModal !== 'security') return null;

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: "As novas senhas não coincidem!" });
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setIsLoading(true);
    const result = await updatePassword(formData.currentPassword, formData.newPassword);
    setIsLoading(false);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const start2FASetup = async () => {
    setIsLoading(true);
    try {
        const data = await generate2FA();
        
        // Geração da imagem é feita AQUI no frontend usando a URL otpath retornada
        // Isso remove a necessidade do backend lidar com canvas
        const qrCodeImg = await QRCode.toDataURL(data.otpauthUrl);
        
        setQrData({ secret: data.secret, qrCodeImg });
        setSetupStep(1);
    } catch(e) {
        setMessage({ type: 'error', text: "Erro ao iniciar configuração 2FA." });
    }
    setIsLoading(false);
  };

  const confirm2FASetup = async () => {
    if (!qrData || otpToken.length !== 6) return;
    setIsLoading(true);
    const res = await enable2FA(qrData.secret, otpToken);
    setIsLoading(false);

    if (res.success) {
        setSetupStep(0); // Reset
        setQrData(null);
        setOtpToken('');
        setMessage({ type: 'success', text: res.message });
    } else {
        setMessage({ type: 'error', text: res.message });
    }
  };

  const handleDisable2FA = async () => {
      setIsLoading(true);
      const res = await disable2FA(disablePassword);
      setIsLoading(false);
      
      if (res.success) {
          setMessage({ type: 'success', text: res.message });
          setDisablePassword('');
      } else {
          setMessage({ type: 'error', text: res.message });
      }
  };

  const closeModals = () => {
    setActiveModal(null);
    setMessage(null);
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSetupStep(0);
    setOtpToken('');
    setDisablePassword('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={closeModals}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative z-10 my-auto"
      >
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <ShieldCheck className="text-teal-500" />
              Segurança
            </h2>
            <button 
              onClick={closeModals} 
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 mb-6 rounded-2xl text-sm font-medium flex items-center gap-2 ${
                message.type === 'success' 
                ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </motion.div>
          )}

          <div className="space-y-8">
            {/* 2FA Section */}
            <div className={`p-5 rounded-3xl border ${is2FAEnabled ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-2xl shadow-sm mt-1 ${is2FAEnabled ? 'bg-teal-500 text-white' : 'bg-white text-slate-400'}`}>
                  {is2FAEnabled ? <Lock size={20} /> : <Unlock size={20} />}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">Autenticação em Duas Etapas (2FA)</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {is2FAEnabled 
                      ? "Sua conta está protegida. Será solicitado um código extra ao fazer login." 
                      : "Proteja sua conta solicitando um código do seu app autenticador a cada login."}
                  </p>
                </div>
              </div>

              {!is2FAEnabled && setupStep === 0 && (
                  <button 
                    onClick={start2FASetup}
                    disabled={isLoading}
                    className="w-full py-2 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                  >
                     {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                         <>
                            <QrCode size={16} /> Configurar Agora
                         </>
                     )}
                  </button>
              )}

              {!is2FAEnabled && setupStep === 1 && qrData && (
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                          <img src={qrData.qrCodeImg} alt="2FA QR Code" className="w-40 h-40 mix-blend-multiply" />
                          <p className="text-[10px] text-slate-400 font-mono mt-2 bg-slate-100 px-2 py-1 rounded">Secret: {qrData.secret}</p>
                      </div>
                      <div className="text-xs text-slate-500 text-center px-4">
                          1. Abra seu app (Google Auth, Authy).<br/>
                          2. Escaneie o código acima.<br/>
                          3. Digite o código de 6 dígitos gerado.
                      </div>
                      <input 
                          value={otpToken}
                          onChange={e => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000 000"
                          className="w-full text-center text-xl tracking-[0.5em] font-bold py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0"
                          autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setSetupStep(0)} className="flex-1 py-2 text-slate-500 font-bold text-sm">Cancelar</button>
                        <button 
                            onClick={confirm2FASetup}
                            disabled={otpToken.length !== 6 || isLoading}
                            className="flex-1 py-2 bg-teal-500 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Ativar"}
                        </button>
                      </div>
                  </div>
              )}

              {is2FAEnabled && (
                  <div className="space-y-3 pt-2 border-t border-teal-100">
                      <input 
                         type="password"
                         value={disablePassword}
                         onChange={e => setDisablePassword(e.target.value)}
                         placeholder="Confirme sua senha para desativar"
                         className="w-full px-3 py-2 text-sm border border-teal-200 rounded-lg focus:ring-1 focus:ring-teal-500 bg-white/50"
                      />
                      <button 
                         onClick={handleDisable2FA}
                         disabled={!disablePassword || isLoading}
                         className="w-full py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                         {isLoading ? <Loader2 className="animate-spin mx-auto" size={14} /> : "Desativar 2FA"}
                      </button>
                  </div>
              )}
            </div>

            {/* Password Change Form */}
            <form className="space-y-6" onSubmit={handleSubmitPassword}>
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <KeyRound size={14} />
                  Redefinir Senha
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Senha Atual</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type={showPass ? "text" : "password"}
                      required
                      value={formData.currentPassword}
                      onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-teal-500"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nova Senha</label>
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    value={formData.newPassword}
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all font-medium"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirmar Nova Senha</label>
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all font-medium"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-slate-800 hover:bg-slate-900 rounded-2xl font-bold text-white text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Nova Senha'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

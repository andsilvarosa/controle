import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Smartphone, Loader2, AlertTriangle, Fingerprint, Eye, EyeOff, Check, Sparkles, LayoutDashboard, Send, KeyRound, ShieldCheck } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { MainLogo } from '../components/UI/MainLogo';

export const Auth: React.FC = () => {
  const { login, signup, forgotPassword, resetPassword, isLoading } = useFinanceStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  
  // 2FA Flow
  const [require2FA, setRequire2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // Recovery Flow
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 👀 O OLHO: Lê o Token da URL e gere credenciais salvas
  useEffect(() => {
    const savedEmail = localStorage.getItem('sos_saved_email');
    const savedPassword = localStorage.getItem('sos_saved_password');
    
    if (savedEmail) {
      setFormData(prev => ({ 
        ...prev, 
        email: savedEmail,
        password: savedPassword || '' 
      }));
      setRememberMe(true);
    }

    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      setRecoveryCode(urlToken);
      setIsRecovery(true);
      setRecoveryStep(2);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 9) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setFormData({ ...formData, phone: val });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log("handleLoginSubmit chamado. require2FA:", require2FA);
    
    if (require2FA) {
        console.log("Auth.tsx: Enviando código 2FA para validação:", twoFactorCode);
        const result = await login(formData.email, formData.password, twoFactorCode);
        console.log("Auth.tsx: Resultado da validação 2FA:", result);
        if (result.success) {
            console.log("Auth.tsx: Login 2FA bem-sucedido!");
            setRequire2FA(false);
            setTwoFactorCode('');
        } else {
            console.error("Auth.tsx: Erro na validação do 2FA:", result.message);
            setError(result.message || 'Código inválido.');
        }
        return;
    }

    console.log("Tentando login inicial (passo 1)...");
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      console.log("Login inicial bem-sucedido (sem 2FA).");
      if (rememberMe) {
        localStorage.setItem('sos_saved_email', formData.email);
        localStorage.setItem('sos_saved_password', formData.password);
      } else {
        localStorage.removeItem('sos_saved_email');
        localStorage.removeItem('sos_saved_password');
      }
    } else {
      if (result.require2fa) {
         setRequire2FA(true);
         setTempUserId(result.tempId || '');
         setError(''); 
      } else {
         setError(result.message || 'Credenciais inválidas.');
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    const result = await signup({ ...formData, avatar: 'icon:User:teal' });
    if (!result.success) setError(result.message || 'Erro ao criar conta.');
  };

  // --- RECOVERY HANDLERS ---
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsProcessing(true);

    const result = await forgotPassword(recoveryEmail);
    setIsProcessing(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setRecoveryStep(2);
    } else {
      setError(result.message);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmNewPassword) {
      setError('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setIsProcessing(true);

    const result = await resetPassword(recoveryCode, newPassword);
    setIsProcessing(false);

    if (result.success) {
      setSuccessMsg("Senha redefinida com sucesso! Redirecionando...");
      setTimeout(() => {
        setIsRecovery(false);
        setRecoveryStep(1);
        setSuccessMsg('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-brand-gray dark:bg-brand-dark selection:bg-brand-green selection:text-white overflow-x-hidden transition-colors duration-500">
      
      {/* Background Decorativo Sutil */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-[60vw] h-[60vw] bg-brand-green/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-20 -left-20 w-[50vw] h-[50vw] bg-brand-green/5 rounded-full blur-[100px]" 
        />
      </div>

      <div className="flex-1 flex flex-col justify-center w-full p-4 lg:p-0 z-10 py-8 lg:py-0">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[950px] mx-auto bg-white dark:bg-zinc-900 rounded-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row lg:h-[640px] border border-black/[0.03] dark:border-white/[0.05]"
        >
          
          {/* COLUNA VISUAL (ESQUERDA) - Estilo PicPay Green */}
          <div className="lg:w-[42%] p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden bg-brand-green min-h-[280px] lg:min-h-0">
             {/* Padrão de círculos sutil */}
             <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 border-[30px] border-white rounded-full -ml-24 -mb-24" />
             </div>

             <div className="relative z-10">
                <div className="flex items-center gap-3 text-white mb-10 lg:mb-14">
                  <div className="p-2.5 bg-white rounded-2xl shadow-xl shadow-black/10">
                     <MainLogo size={32} className="text-brand-green" />
                  </div>
                  <span className="font-extrabold text-xl lg:text-2xl tracking-tight">SOS Controle</span>
                </div>
                
                <motion.div
                  key={isLogin ? "login-text" : "signup-text"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-6">
                    {isRecovery 
                      ? "Recupere sua conta."
                      : require2FA 
                          ? "Segurança em primeiro lugar."
                          : (isLogin ? "Olá! Que bom ver você de novo." : "Crie sua conta em segundos.")}
                  </h1>
                  
                  <p className="text-white/80 text-sm lg:text-base font-medium leading-relaxed max-w-[280px]">
                    Gerencie suas finanças com a simplicidade que você merece.
                  </p>
                </motion.div>
             </div>

             <div className="relative z-10 mt-auto pt-8">
                <div className="flex gap-1.5">
                   <div className="w-8 h-1.5 bg-white rounded-full" />
                   <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                   <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                </div>
             </div>
          </div>

          {/* COLUNA FORMULÁRIO (DIREITA) */}
          <div className="lg:w-[58%] bg-white dark:bg-zinc-900 relative flex flex-col h-full">
            {!isRecovery && !require2FA && (
              <div className="absolute top-6 right-6 lg:top-10 lg:right-10 z-20">
                 <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-black/[0.03] dark:border-white/[0.05]">
                    <button 
                        type="button"
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isLogin ? 'bg-white dark:bg-zinc-700 text-brand-green shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                    >
                        Entrar
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${!isLogin ? 'bg-white dark:bg-zinc-700 text-brand-green shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                    >
                        Criar conta
                    </button>
                 </div>
              </div>
            )}

            <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-8 lg:p-16 flex flex-col justify-center">
              <div className="pt-12 lg:pt-0">
                <AnimatePresence mode="wait">
                  {/* 2FA INPUT UI */}
                  {require2FA ? (
                     <motion.div
                       key="2fa"
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="max-w-sm mx-auto w-full space-y-8"
                     >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-green/20">
                               <ShieldCheck className="text-brand-green" size={40} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Verificação</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">
                               Digite o código de 6 dígitos para confirmar sua identidade.
                            </p>
                        </div>

                        {error && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                             <AlertTriangle size={18} className="flex-shrink-0" />
                             {error}
                          </div>
                        )}

                        <form onSubmit={handleLoginSubmit} className="space-y-8">
                           <div className="space-y-2">
                              <div className="relative">
                                 <input 
                                    type="text"
                                    required
                                    autoFocus
                                    value={twoFactorCode}
                                    onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-3xl tracking-[0.4em] text-center shadow-inner"
                                    placeholder="000000"
                                 />
                              </div>
                           </div>

                           <button 
                              type="submit"
                              disabled={isLoading || twoFactorCode.length !== 6}
                              className="w-full py-5 bg-brand-green hover:bg-brand-green/90 text-white rounded-3xl font-extrabold text-base shadow-xl shadow-brand-green/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                           >
                              {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Confirmar Acesso"}
                           </button>
                        </form>
                        
                        <button 
                           onClick={() => { setRequire2FA(false); setTwoFactorCode(''); setError(''); }}
                           className="w-full text-zinc-400 hover:text-brand-green text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                           Cancelar e Voltar
                        </button>
                     </motion.div>
                  ) : !isRecovery ? (
                    /* LOGIN / SIGNUP FORM */
                    <motion.form
                       key={isLogin ? "login-form" : "signup-form"}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                       onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} 
                       className="space-y-5 max-w-sm mx-auto w-full"
                    >
                       {error && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
                          >
                             <AlertTriangle size={18} className="flex-shrink-0" />
                             {error}
                          </motion.div>
                       )}

                       {!isLogin && (
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Como quer ser chamado?</label>
                             <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                <input 
                                   required
                                   value={formData.name}
                                   onChange={e => setFormData({...formData, name: e.target.value})}
                                   className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                   placeholder="Seu nome completo"
                                />
                             </div>
                          </div>
                       )}

                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">E-mail</label>
                          <div className="relative">
                             <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                             <input 
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                placeholder="exemplo@email.com"
                             />
                          </div>
                       </div>

                       {!isLogin && (
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Celular</label>
                             <div className="relative">
                                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                <input 
                                   type="tel"
                                   required
                                   value={formData.phone}
                                   onChange={handlePhoneChange}
                                   className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                   placeholder="(00) 00000-0000"
                                />
                             </div>
                          </div>
                       )}

                       <div className="space-y-1.5">
                          <div className="flex justify-between items-end px-1">
                             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Senha</label>
                             {isLogin && (
                               <button 
                                 type="button" 
                                 onClick={() => setIsRecovery(true)} 
                                 className="text-xs font-bold text-brand-green hover:underline transition-all"
                               >
                                 Esqueceu?
                               </button>
                             )}
                          </div>
                          <div className="relative">
                             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                             <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full pl-14 pr-12 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                placeholder="Sua senha secreta"
                             />
                             <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-green transition-colors"
                             >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                             </button>
                          </div>
                       </div>

                       {!isLogin && (
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Confirme sua senha</label>
                             <input 
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                placeholder="Repita a senha"
                             />
                          </div>
                       )}

                       {isLogin && (
                          <div className="flex items-center gap-3 pt-2">
                            <button 
                               type="button"
                               onClick={() => setRememberMe(!rememberMe)}
                               className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-brand-green border-brand-green' : 'bg-transparent border-zinc-200 dark:border-zinc-700 hover:border-brand-green'}`}
                            >
                               {rememberMe && <Check size={14} className="text-white" strokeWidth={4} />}
                            </button>
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>Lembrar de mim</span>
                          </div>
                       )}

                       <button 
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-5 bg-brand-green hover:bg-brand-green/90 text-white rounded-3xl font-extrabold text-base shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 group relative overflow-hidden"
                       >
                          {isLoading ? (
                             <Loader2 className="animate-spin" size={24} />
                          ) : (
                             <>
                                <span>{isLogin ? 'Entrar agora' : 'Criar minha conta'}</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                             </>
                          )}
                       </button>
                    </motion.form>
                  ) : (
                    /* RECOVERY FLOW */
                     <motion.div
                       key="recovery"
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="max-w-sm mx-auto w-full space-y-8"
                     >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-200 dark:border-zinc-700">
                               <Sparkles className="text-brand-green" size={40} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Recuperação</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">
                               {recoveryStep === 1 
                                 ? "Enviaremos um código de segurança para o seu e-mail." 
                                 : "Quase lá! Defina sua nova senha de acesso."}
                            </p>
                        </div>

                        {error && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                             <AlertTriangle size={18} className="flex-shrink-0" />
                             {error}
                          </div>
                        )}

                        {successMsg && (
                          <div className="p-4 bg-brand-green/10 border border-brand-green/20 rounded-2xl flex items-center gap-3 text-brand-green text-xs font-bold">
                             <Check size={18} className="flex-shrink-0" />
                             {successMsg}
                          </div>
                        )}

                        {recoveryStep === 1 ? (
                           <form onSubmit={handleRequestCode} className="space-y-6">
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">E-mail cadastrado</label>
                                 <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                    <input 
                                       type="email"
                                       required
                                       value={recoveryEmail}
                                       onChange={e => setRecoveryEmail(e.target.value)}
                                       className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                       placeholder="seu@email.com"
                                    />
                                 </div>
                              </div>
                              <button 
                                 type="submit"
                                 disabled={isProcessing}
                                 className="w-full py-5 bg-zinc-900 dark:bg-zinc-700 text-white rounded-3xl font-extrabold text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10"
                              >
                                 {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                       <span>Enviar código</span>
                                       <Send size={18} />
                                    </>
                                 )}
                              </button>
                           </form>
                        ) : (
                           <form onSubmit={handleResetSubmit} className="space-y-5">
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Código de 6 dígitos</label>
                                 <div className="relative">
                                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                    <input 
                                       type="text"
                                       required
                                       value={recoveryCode}
                                       onChange={e => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                       className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-lg tracking-widest"
                                       placeholder="123456"
                                    />
                                 </div>
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Nova senha</label>
                                 <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                    <input 
                                       type="password"
                                       required
                                       value={newPassword}
                                       onChange={e => setNewPassword(e.target.value)}
                                       className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                       placeholder="Mínimo 8 caracteres"
                                    />
                                 </div>
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Confirme a nova senha</label>
                                 <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                    <input 
                                       type="password"
                                       required
                                       value={confirmNewPassword}
                                       onChange={e => setConfirmNewPassword(e.target.value)}
                                       className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-sm"
                                       placeholder="Repita a senha"
                                    />
                                 </div>
                              </div>
                              <button 
                                 type="submit"
                                 disabled={isProcessing}
                                 className="w-full py-5 bg-brand-green hover:bg-brand-green/90 text-white rounded-3xl font-extrabold text-sm shadow-xl shadow-brand-green/20 transition-all flex items-center justify-center gap-3"
                              >
                                 {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Redefinir Senha"}
                              </button>
                           </form>
                        )}

                        <button 
                           onClick={() => { setIsRecovery(false); setRecoveryStep(1); setError(''); setSuccessMsg(''); setNewPassword(''); setConfirmNewPassword(''); }}
                           className="w-full text-zinc-400 hover:text-brand-green text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                           Voltar ao início
                        </button>
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative pb-8 lg:pb-0 lg:fixed lg:bottom-6 lg:left-0 lg:w-full text-center pointer-events-none z-10 opacity-40">
         <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.2em]">
            SOS Controle &copy; 2024 • Powered by PicPay Style
         </p>
      </div>
    </div>
  );
};
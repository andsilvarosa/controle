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
    
    if (require2FA) {
        const result = await login(formData.email, formData.password, twoFactorCode);
        if (result.success) {
            setRequire2FA(false);
            setTwoFactorCode('');
        } else {
            setError(result.message || 'Código inválido.');
        }
        return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
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
    <div className="min-h-screen w-full flex flex-col relative bg-[#0f172a] selection:bg-teal-500 selection:text-white overflow-x-hidden">
      
      {/* Background Animado */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center w-full p-4 lg:p-0 z-10 py-8 lg:py-0">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[1000px] mx-auto bg-slate-900/60 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:h-[600px]"
        >
          
          {/* COLUNA VISUAL (ESQUERDA) */}
          <div className="lg:w-[45%] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-teal-900/40 to-slate-900/40 min-h-[250px] lg:min-h-0">
             <div className="relative z-10">
                <div className="flex items-center gap-3 text-white mb-6 lg:mb-8">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                     <MainLogo size={28} className="brightness-150 drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                  </div>
                  <span className="font-bold text-lg lg:text-xl tracking-tight">SOS Controle</span>
                </div>
                
                <motion.h1 
                  key={isLogin ? "login-title" : "signup-title"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl lg:text-4xl font-bold text-white leading-tight mb-2 lg:mb-4"
                >
                  {isRecovery 
                    ? "Recuperação de Acesso."
                    : require2FA 
                        ? "Verificação de Segurança."
                        : (isLogin ? "Bem-vindo de volta ao comando." : "Inicie sua jornada financeira.")}
                </motion.h1>
                
                <p className="text-slate-400 text-xs lg:text-sm leading-relaxed hidden sm:block">
                  Plataforma de inteligência financeira com automação de regras, orçamentos dinâmicos e segurança de nível bancário.
                </p>
             </div>
          </div>

          {/* COLUNA FORMULÁRIO (DIREITA) */}
          <div className="lg:w-[55%] bg-slate-950/50 relative flex flex-col h-full">
            {!isRecovery && !require2FA && (
              <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-20 flex bg-slate-900/80 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                 <button 
                    type="button"
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`px-3 py-1.5 lg:px-4 lg:py-1.5 rounded-lg text-xs font-bold transition-all ${isLogin ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'}`}
                 >
                    Login
                 </button>
                 <button 
                    type="button"
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`px-3 py-1.5 lg:px-4 lg:py-1.5 rounded-lg text-xs font-bold transition-all ${!isLogin ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'}`}
                 >
                    Cadastro
                 </button>
              </div>
            )}

            <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-6 lg:p-12 flex flex-col justify-center">
              <div className="pt-10 lg:pt-0">
                <AnimatePresence mode="wait">
                  {/* 2FA INPUT UI */}
                  {require2FA ? (
                     <motion.div
                       key="2fa"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="max-w-sm mx-auto w-full space-y-6"
                     >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/20 shadow-xl">
                               <ShieldCheck className="text-teal-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Autenticação 2FA</h3>
                            <p className="text-slate-400 text-sm mt-2">
                               Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
                            </p>
                        </div>

                        {error && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
                             <AlertTriangle size={16} className="flex-shrink-0" />
                             {error}
                          </div>
                        )}

                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                           <div className="group space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">Código OTP</label>
                              <div className="relative">
                                 <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                 <input 
                                    type="text"
                                    required
                                    autoFocus
                                    value={twoFactorCode}
                                    onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-bold text-lg tracking-[0.5em] text-center"
                                    placeholder="000000"
                                 />
                              </div>
                           </div>

                           <button 
                              disabled={isLoading || twoFactorCode.length !== 6}
                              className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold text-base shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                           >
                              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Verificar e Entrar"}
                           </button>
                        </form>
                        
                        <button 
                           onClick={() => { setRequire2FA(false); setTwoFactorCode(''); setError(''); }}
                           className="w-full text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                           Voltar
                        </button>
                     </motion.div>
                  ) : !isRecovery ? (
                    /* LOGIN / SIGNUP FORM */
                    <motion.form
                       key={isLogin ? "login-form" : "signup-form"}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.3 }}
                       onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} 
                       className="space-y-4 lg:space-y-5 max-w-sm mx-auto w-full"
                    >
                       {error && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold"
                          >
                             <AlertTriangle size={16} className="flex-shrink-0" />
                             {error}
                          </motion.div>
                       )}

                       {!isLogin && (
                          <div className="group space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">Nome Completo</label>
                             <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                <input 
                                   required
                                   value={formData.name}
                                   onChange={e => setFormData({...formData, name: e.target.value})}
                                   className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                   placeholder="Ex: João Silva"
                                />
                             </div>
                          </div>
                       )}

                       <div className="group space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">E-mail</label>
                          <div className="relative">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                             <input 
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                placeholder="nome@exemplo.com"
                             />
                          </div>
                       </div>

                       {!isLogin && (
                          <div className="group space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">WhatsApp / Celular</label>
                             <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                <input 
                                   type="tel"
                                   required
                                   value={formData.phone}
                                   onChange={handlePhoneChange}
                                   className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                   placeholder="(00) 00000-0000"
                                />
                             </div>
                          </div>
                       )}

                       <div className="group space-y-1.5">
                          <div className="flex justify-between items-end px-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-teal-400 transition-colors">Senha</label>
                             {isLogin && <button type="button" onClick={() => setIsRecovery(true)} className="text-[10px] text-teal-500 hover:text-white transition-colors">Esqueceu a senha?</button>}
                          </div>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                             <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full pl-11 pr-10 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                placeholder="••••••••"
                             />
                             <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                             >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                             </button>
                          </div>
                       </div>

                       {!isLogin && (
                          <div className="group space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">Confirmar Senha</label>
                             <input 
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                placeholder="Repita sua senha"
                             />
                          </div>
                       )}

                       {isLogin && (
                          <div className="flex items-center gap-2 pt-1">
                            <button 
                               type="button"
                               onClick={() => setRememberMe(!rememberMe)}
                               className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-teal-500 border-teal-500' : 'bg-transparent border-slate-600 hover:border-teal-500'}`}
                            >
                               {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                            </button>
                            <span className="text-sm text-slate-400 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>Lembrar credenciais</span>
                          </div>
                       )}

                       <button 
                          disabled={isLoading}
                          className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl font-bold text-base shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale mt-2 group relative overflow-hidden"
                       >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          {isLoading ? (
                             <Loader2 className="animate-spin" size={20} />
                          ) : (
                             <>
                                <span className="relative">{isLogin ? 'Acessar Dashboard' : 'Criar Conta Gratuita'}</span>
                                <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
                             </>
                          )}
                       </button>
                    </motion.form>
                  ) : (
                    /* RECOVERY FLOW */
                     <motion.div
                       key="recovery"
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="max-w-sm mx-auto w-full space-y-6 pt-8 lg:pt-0"
                     >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-xl">
                               <Sparkles className="text-teal-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Recuperação de Acesso</h3>
                            <p className="text-slate-400 text-sm mt-2">
                               {recoveryStep === 1 
                                 ? "Digite seu e-mail para receber um código de segurança." 
                                 : "Insira o código enviado e sua nova senha."}
                            </p>
                        </div>

                        {error && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
                             <AlertTriangle size={16} className="flex-shrink-0" />
                             {error}
                          </div>
                        )}

                        {successMsg && (
                          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center gap-3 text-teal-400 text-xs font-bold">
                             <Check size={16} className="flex-shrink-0" />
                             {successMsg}
                          </div>
                        )}

                        {recoveryStep === 1 ? (
                           <form onSubmit={handleRequestCode} className="space-y-4">
                              <div className="group space-y-1.5">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">E-mail Cadastrado</label>
                                 <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                    <input 
                                       type="email"
                                       required
                                       value={recoveryEmail}
                                       onChange={e => setRecoveryEmail(e.target.value)}
                                       className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                       placeholder="seu@email.com"
                                    />
                                 </div>
                              </div>
                              <button 
                                 type="submit"
                                 disabled={isProcessing}
                                 className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                              >
                                 {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                       <span>Enviar Código</span>
                                       <Send size={16} />
                                    </>
                                 )}
                              </button>
                           </form>
                        ) : (
                           <form onSubmit={handleResetSubmit} className="space-y-4">
                              <div className="group space-y-1.5">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">Código de 6 Dígitos</label>
                                 <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                    <input 
                                       type="text"
                                       required
                                       value={recoveryCode}
                                       onChange={e => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                       className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm tracking-widest"
                                       placeholder="123456"
                                    />
                                 </div>
                              </div>
                              <div className="group space-y-1.5">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">Nova Senha</label>
                                 <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                    <input 
                                       type="password"
                                       required
                                       value={newPassword}
                                       onChange={e => setNewPassword(e.target.value)}
                                       className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                       placeholder="Nova senha segura"
                                    />
                                 </div>
                              </div>
                              <div className="group space-y-1.5">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within:text-teal-400 transition-colors">Confirmar Nova Senha</label>
                                 <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                    <input 
                                       type="password"
                                       required
                                       value={confirmNewPassword}
                                       onChange={e => setConfirmNewPassword(e.target.value)}
                                       className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-medium text-sm"
                                       placeholder="Repita a nova senha"
                                    />
                                 </div>
                              </div>
                              <button 
                                 type="submit"
                                 disabled={isProcessing}
                                 className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                 {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Redefinir Senha"}
                              </button>
                           </form>
                        )}

                        <button 
                           onClick={() => { setIsRecovery(false); setRecoveryStep(1); setError(''); setSuccessMsg(''); setNewPassword(''); setConfirmNewPassword(''); }}
                           className="w-full text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                           Voltar ao Login
                        </button>
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative pb-8 lg:pb-0 lg:fixed lg:bottom-4 lg:left-0 lg:w-full text-center pointer-events-none z-10 opacity-50">
         <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
            SOS Controle &copy; 2024 • Architected by Anderson Rosa
         </p>
      </div>
    </div>
  );
};
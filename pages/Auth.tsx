import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Smartphone, Loader2, AlertTriangle, Fingerprint, Eye, EyeOff, Check, Sparkles, LayoutDashboard, Send, KeyRound, ShieldCheck, Zap, Bell, Activity, TrendingUp, Shield, LockIcon, Info } from 'lucide-react';
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
    <div className="min-h-screen w-full flex flex-col relative bg-[#f4f4f4] dark:bg-brand-dark selection:bg-brand-green selection:text-white overflow-x-hidden transition-colors duration-500 font-sans">
      
      {/* Background Decorativo Sutil */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-[60vw] h-[60vw] bg-brand-green/10 rounded-full blur-[100px]" 
        />
      </div>

      {/* HEADER & LOGIN FORM (TOP RIGHT) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 lg:pt-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        
        {/* LOGO & BRANDING */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 bg-brand-green rounded-3xl shadow-2xl shadow-brand-green/20">
            <MainLogo size={40} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl lg:text-3xl tracking-tighter text-brand-dark dark:text-white">SOS Controle</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">Finanças Inteligentes</span>
          </div>
        </motion.div>

        {/* COMPACT AUTH FORM */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-auto"
        >
          <div className="bg-white dark:bg-zinc-900 p-6 lg:p-8 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/[0.03] dark:border-white/[0.05] w-full lg:min-w-[420px]">
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">
                {isRecovery ? "Recuperar" : require2FA ? "Segurança" : (isLogin ? "Entrar" : "Criar Conta")}
              </h2>
              {!isRecovery && !require2FA && (
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                  <button 
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-zinc-700 text-brand-green shadow-sm' : 'text-zinc-400'}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-zinc-700 text-brand-green shadow-sm' : 'text-zinc-400'}`}
                  >
                    Cadastro
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {require2FA ? (
                <motion.form 
                  key="2fa"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleLoginSubmit} 
                  className="space-y-4"
                >
                  <input 
                    type="text"
                    required
                    autoFocus
                    value={twoFactorCode}
                    onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-2xl text-zinc-900 dark:text-white focus:outline-none transition-all font-black text-2xl tracking-[0.5em] text-center"
                    placeholder="000000"
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || twoFactorCode.length !== 6}
                    className="w-full py-4 bg-brand-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-green/20 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Verificar"}
                  </button>
                  <button onClick={() => setRequire2FA(false)} className="w-full text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-brand-green">Voltar</button>
                </motion.form>
              ) : !isRecovery ? (
                <motion.form
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-2 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-tight">
                      <AlertTriangle size={14} /> {error}
                    </div>
                  )}

                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-2xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-sm"
                        placeholder="Nome completo"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-2xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-sm"
                      placeholder="E-mail"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-2xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-sm"
                      placeholder="Senha"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {isLogin && (
                    <div className="flex justify-between items-center px-1">
                      <button onClick={() => setRememberMe(!rememberMe)} type="button" className="flex items-center gap-2 group">
                        <div className={`w-4 h-4 rounded border transition-all ${rememberMe ? 'bg-brand-green border-brand-green' : 'border-zinc-300 group-hover:border-brand-green'}`}>
                          {rememberMe && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lembrar</span>
                      </button>
                      <button onClick={() => setIsRecovery(true)} type="button" className="text-[10px] font-black text-brand-green uppercase tracking-widest hover:underline">Esqueceu?</button>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-green hover:bg-brand-green/90 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-green/20 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (isLogin ? 'Entrar' : 'Cadastrar')}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="recovery"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={recoveryStep === 1 ? handleRequestCode : handleResetSubmit}
                  className="space-y-4"
                >
                  {recoveryStep === 1 ? (
                    <input 
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-2xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-sm"
                      placeholder="E-mail cadastrado"
                    />
                  ) : (
                    <div className="space-y-3">
                      <input 
                        type="text"
                        required
                        value={recoveryCode}
                        onChange={e => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-2xl text-zinc-900 dark:text-white focus:outline-none transition-all font-black text-center tracking-widest"
                        placeholder="Código"
                      />
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-brand-green rounded-2xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-sm"
                        placeholder="Nova senha"
                      />
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-brand-green text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Confirmar"}
                  </button>
                  <button onClick={() => setIsRecovery(false)} className="w-full text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-brand-green">Voltar</button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* PRESENTATION CARDS (BOTTOM) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mt-12 lg:mt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CARD ESQUERDA: DESTAQUES DO SOS */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 p-8 lg:p-12 rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-black/[0.02] dark:border-white/[0.05]"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-brand-green/10 rounded-2xl">
                <Sparkles className="text-brand-green" size={24} />
              </div>
              <h3 className="text-xl lg:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight">Destaques do SOS</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-black/[0.02] dark:border-white/[0.02] group hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-xl hover:shadow-black/5">
                <Activity className="text-brand-green mb-4" size={24} />
                <h4 className="font-black text-brand-dark dark:text-white text-sm mb-2">Projeções Inteligentes</h4>
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">Antecipe seu saldo para os próximos meses com IA.</p>
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-black/[0.02] dark:border-white/[0.02] group hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-xl hover:shadow-black/5">
                <Zap className="text-brand-green mb-4" size={24} />
                <h4 className="font-black text-brand-dark dark:text-white text-sm mb-2">Automação de Regras</h4>
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">Categorização automática de todos os seus lançamentos.</p>
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-black/[0.02] dark:border-white/[0.02] group hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-xl hover:shadow-black/5">
                <Bell className="text-brand-green mb-4" size={24} />
                <h4 className="font-black text-brand-dark dark:text-white text-sm mb-2">Alertas Ativos</h4>
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">Nunca mais esqueça um vencimento importante.</p>
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-black/[0.02] dark:border-white/[0.02] group hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-xl hover:shadow-black/5">
                <EyeOff className="text-brand-green mb-4" size={24} />
                <h4 className="font-black text-brand-dark dark:text-white text-sm mb-2">Modo Privacidade</h4>
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">Esconda seus valores sensíveis com apenas um clique.</p>
              </div>
            </div>
          </motion.div>

          {/* CARD DIREITA: SEGURANÇA & LGPD */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-brand-dark p-8 lg:p-12 rounded-4xl shadow-2xl relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px] -mr-32 -mt-32" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-brand-green rounded-2xl shadow-lg shadow-brand-green/20">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">Segurança & LGPD</h3>
              </div>

              <p className="text-zinc-400 text-sm lg:text-base font-bold leading-relaxed mb-10 max-w-md">
                Sua privacidade é nossa prioridade absoluta. Operamos com os mais rigorosos padrões de proteção de dados para garantir que suas informações financeiras estejam sempre seguras.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-2 h-2 rounded-full bg-brand-green mt-2 group-hover:scale-150 transition-transform" />
                  <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Conformidade LGPD</h4>
                    <p className="text-[10px] text-zinc-500 font-bold">Tratamento de dados totalmente alinhado à Lei Geral de Proteção de Dados.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-2 h-2 rounded-full bg-brand-green mt-2 group-hover:scale-150 transition-transform" />
                  <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Criptografia de Ponta</h4>
                    <p className="text-[10px] text-zinc-500 font-bold">Seus dados são protegidos com protocolos de segurança bancária.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-2 h-2 rounded-full bg-brand-green mt-2 group-hover:scale-150 transition-transform" />
                  <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Zero Compartilhamento</h4>
                    <p className="text-[10px] text-zinc-500 font-bold">Não vendemos nem compartilhamos seus dados com terceiros.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 text-center lg:text-left opacity-30">
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
          SOS Controle &copy; 2024 • Segurança Bancária Certificada
        </p>
      </div>
    </div>
  );
};

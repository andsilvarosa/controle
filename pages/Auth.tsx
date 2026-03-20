import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Smartphone, Loader2, AlertTriangle, Fingerprint, Eye, EyeOff, Check, Sparkles, LayoutDashboard, Send, KeyRound, ShieldCheck, Zap, Bell, Activity, TrendingUp, Shield, LockIcon, Info, Sun, Moon } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { MainLogo } from '../components/UI/MainLogo';

export const Auth: React.FC = () => {
  const { login, signup, forgotPassword, resetPassword, isLoading, theme, toggleTheme } = useFinanceStore();
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F5] dark:bg-brand-dark selection:bg-picpay-500 selection:text-white overflow-x-hidden transition-colors duration-500 font-sans p-4 lg:p-8">
      
      {/* Botão de Alternância de Tema */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-black/[0.05] dark:border-white/[0.05] text-zinc-500 dark:text-zinc-400 hover:scale-110 active:scale-95 transition-all z-50 group"
        title={theme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
      >
        {theme === 'light' ? (
          <Moon size={20} className="group-hover:text-picpay-500 transition-colors" />
        ) : (
          <Sun size={20} className="group-hover:text-picpay-500 transition-colors" />
        )}
      </motion.button>

      {/* Background Decorativo Sutil */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-picpay-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-picpay-500/5 rounded-full blur-[120px]" />
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className="relative z-10 w-full max-w-[1000px] flex flex-col items-center">
        
        {/* CARD DE AUTENTICAÇÃO "SPLIT" */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white dark:bg-zinc-900 rounded-[48px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col lg:flex-row border border-black/[0.02] dark:border-white/[0.05]"
        >
          
          {/* LADO ESQUERDO: BRANDING (VERDE PICPAY) */}
          <div className="w-full lg:w-[45%] bg-picpay-500 p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
            {/* Efeito de Brilho no Fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-[50px] -ml-24 -mb-24" />

            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-12"
              >
                <div className="p-2.5 bg-white rounded-2xl shadow-lg">
                  <MainLogo size={32} className="text-picpay-500" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-white">SOS Controle</span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-6"
              >
                Sua vida financeira <br />
                <span className="opacity-70">em um só lugar.</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-sm font-medium leading-relaxed max-w-[280px]"
              >
                Gerencie seus gastos, planeje seu futuro e alcance seus objetivos com inteligência.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 mt-12 lg:mt-0"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-picpay-500 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover opacity-80" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-picpay-500 bg-white flex items-center justify-center text-[10px] font-black text-picpay-500">
                  +10k
                </div>
              </div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-3">Junte-se a milhares de usuários</p>
            </motion.div>
          </div>

          {/* LADO DIREITO: FORMULÁRIO (BRANCO/CINZA) */}
          <div className="w-full lg:w-[55%] p-10 lg:p-16 flex flex-col justify-center">
            
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">
                {isRecovery ? "Recuperar conta" : require2FA ? "Segurança" : (isLogin ? "Bem-vindo de volta!" : "Crie sua conta grátis")}
              </h3>
              <p className="text-zinc-400 text-sm font-medium">
                {isRecovery ? "Siga as instruções para redefinir sua senha" : require2FA ? "Confirme sua identidade para continuar" : (isLogin ? "Acesse sua conta para gerenciar suas finanças" : "Comece sua jornada financeira hoje mesmo")}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {require2FA ? (
                <motion.form 
                  key="2fa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLoginSubmit} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-picpay-50 dark:bg-picpay-500/10 rounded-3xl flex items-center justify-center text-picpay-500">
                        <ShieldCheck size={32} />
                      </div>
                    </div>
                    <input 
                      type="text"
                      required
                      autoFocus
                      value={twoFactorCode}
                      onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-picpay-500 rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-3xl tracking-[0.6em] text-center"
                      placeholder="000000"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || twoFactorCode.length !== 6}
                    className="w-full py-5 bg-picpay-500 hover:bg-picpay-600 text-white rounded-3xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-picpay-500/20 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Verificar Código"}
                  </button>
                  <button onClick={() => setRequire2FA(false)} className="w-full text-xs font-bold text-zinc-400 hover:text-picpay-500 transition-colors uppercase tracking-widest">Voltar</button>
                </motion.form>
              ) : !isRecovery ? (
                <motion.form
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
                  className="space-y-5"
                >
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
                      <AlertTriangle size={18} className="shrink-0" /> {error}
                    </div>
                  )}

                  {!isLogin && (
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-picpay-500 transition-colors" size={20} />
                      <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-picpay-500 rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-base"
                        placeholder="Nome completo"
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-picpay-500 transition-colors" size={20} />
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-picpay-500 rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-base"
                      placeholder="E-mail"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-picpay-500 transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-14 pr-14 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-picpay-500 rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-base"
                      placeholder="Senha"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-picpay-500 transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <button onClick={() => setRememberMe(!rememberMe)} type="button" className="flex items-center gap-2.5 group">
                      <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-picpay-500 border-picpay-500' : 'border-zinc-200 dark:border-zinc-700 group-hover:border-picpay-500'}`}>
                        {rememberMe && <Check size={14} className="text-white stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-zinc-400">Lembrar</span>
                    </button>
                    <button onClick={() => setIsRecovery(true)} type="button" className="text-xs font-bold text-picpay-500 hover:underline">Esqueceu a senha?</button>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-5 bg-picpay-500 hover:bg-picpay-600 text-white rounded-3xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-picpay-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : (isLogin ? 'Entrar' : 'Criar Conta')}
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setError(''); }}
                      className="w-full py-4 text-zinc-400 hover:text-picpay-500 transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                      {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form 
                  key="recovery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={recoveryStep === 1 ? handleRequestCode : handleResetSubmit}
                  className="space-y-6"
                >
                  {recoveryStep === 1 ? (
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-picpay-500 transition-colors" size={20} />
                      <input 
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={e => setRecoveryEmail(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-picpay-500 rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-base"
                        placeholder="E-mail cadastrado"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input 
                        type="text"
                        required
                        value={recoveryCode}
                        onChange={e => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-picpay-500 rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-bold text-center text-xl tracking-[0.4em]"
                        placeholder="Código"
                      />
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-picpay-500 rounded-3xl text-zinc-900 dark:text-white focus:outline-none transition-all font-semibold text-base"
                        placeholder="Nova Senha"
                      />
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 bg-picpay-500 hover:bg-picpay-600 text-white rounded-3xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-picpay-500/20"
                  >
                    {isProcessing ? <Loader2 className="animate-spin mx-auto" size={24} /> : (recoveryStep === 1 ? "Enviar Código" : "Redefinir Senha")}
                  </button>
                  <button onClick={() => setIsRecovery(false)} className="w-full text-xs font-bold text-zinc-400 hover:text-picpay-500 transition-colors uppercase tracking-widest">Voltar ao login</button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* BENTO GRID DE FUNCIONALIDADES (ABAIXO) */}
        <div className="w-full mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="md:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-black/[0.02] dark:border-white/[0.05] shadow-sm flex flex-col lg:flex-row items-center gap-8 group hover:shadow-xl transition-all"
          >
            <div className="w-24 h-24 shrink-0 bg-picpay-50 dark:bg-picpay-500/10 rounded-[32px] flex items-center justify-center text-picpay-500 group-hover:scale-110 transition-transform">
              <Sparkles size={48} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-brand-dark dark:text-white mb-2">Projeções com Inteligência Artificial</h4>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Nosso algoritmo analisa seus hábitos e projeta seu saldo para os próximos meses, ajudando você a tomar decisões melhores hoje.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-picpay-500 p-8 rounded-[40px] shadow-xl shadow-picpay-500/20 flex flex-col justify-between group hover:scale-[1.02] transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Segurança Máxima</h4>
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                Seus dados são protegidos com criptografia de ponta e protocolos bancários.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-black/[0.02] dark:border-white/[0.05] shadow-sm group hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-picpay-50 dark:bg-picpay-500/10 rounded-2xl flex items-center justify-center text-picpay-500 mb-6 group-hover:rotate-12 transition-transform">
              <Zap size={28} />
            </div>
            <h4 className="text-lg font-bold text-brand-dark dark:text-white mb-2">Automação</h4>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Categorização automática de lançamentos e regras inteligentes para economizar tempo.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="md:col-span-2 bg-brand-dark p-8 rounded-[40px] shadow-2xl flex flex-col lg:flex-row items-center gap-8 group hover:shadow-picpay-500/10 transition-all"
          >
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-2">Relatórios Detalhados</h4>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Visualize sua evolução financeira com gráficos interativos e insights poderosos sobre seu comportamento de consumo.
              </p>
            </div>
            <div className="w-full lg:w-48 h-32 bg-zinc-800 rounded-3xl overflow-hidden relative border border-white/5">
              <div className="absolute inset-x-4 bottom-0 h-24 flex items-end gap-2">
                {[40, 70, 45, 90, 60, 85, 50].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1 + (i * 0.1) }}
                    className="flex-1 bg-picpay-500 rounded-t-lg"
                  />
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* FOOTER */}
        <div className="mt-20 pb-12 w-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
          <div className="flex items-center gap-3">
            <MainLogo size={20} className="text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">SOS Controle &copy; 2024</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-picpay-500 cursor-pointer transition-colors">Privacidade</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-picpay-500 cursor-pointer transition-colors">Segurança</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-picpay-500 cursor-pointer transition-colors">Ajuda</span>
          </div>
        </div>

      </div>
    </div>
  );
};

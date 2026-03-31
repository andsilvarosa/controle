import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFinanceStore } from "../../src/store/useFinanceStore";
import { useUIStore } from "../../src/store/useUIStore";
import {
  Mail,
  Lock,
  User,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Zap,
  Shield,
  Info,
  X,
  ChevronRight,
  ArrowRight,
} from "lucide-react-native";

type AuthMode = "login" | "signup" | "recovery" | "twoFactor";
type RecoveryStep = 1 | 2;
type ModalType = "privacy" | "security" | "help" | null;

export default function Login() {
  const router = useRouter();
  const { login, signup, forgotPassword, resetPassword, isLoading } = useFinanceStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<AuthMode>("login");
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>(1);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resetForm = () => {
    setError("");
    setSuccessMsg("");
  };

  const handlePhoneChange = (value: string) => {
    let formatted = value.replace(/\D/g, "");
    if (formatted.length > 11) formatted = formatted.slice(0, 11);
    if (formatted.length > 2) formatted = `(${formatted.slice(0, 2)}) ${formatted.slice(2)}`;
    if (formatted.length > 10) formatted = `${formatted.slice(0, 10)}-${formatted.slice(10)}`;
    setPhone(formatted);
  };

  const handleLogin = async () => {
    resetForm();
    if (!email || !password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      router.replace("/(tabs)/dashboard");
      return;
    }
    if (result.require2fa) {
      setMode("twoFactor");
      return;
    }
    setError(result.message || "Credenciais inválidas.");
  };

  const handleSignup = async () => {
    resetForm();
    if (!name || !email || !phone || !password) {
      setError("Preencha todos os campos para criar sua conta.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    const result = await signup({ name, email, phone, password, avatar: "" });
    if (result.success) {
      setSuccessMsg("Conta criada com sucesso! Faça login para continuar.");
      setMode("login");
    } else {
      setError(result.message || "Erro ao criar conta.");
    }
  };

  const handleRequestRecovery = async () => {
    resetForm();
    if (!email) {
      setError("Informe o e-mail cadastrado.");
      return;
    }
    const result = await forgotPassword(email);
    if (result.success) {
      setSuccessMsg(result.message);
      setRecoveryStep(2);
    } else {
      setError(result.message);
    }
  };

  const handleResetPassword = async () => {
    resetForm();
    if (!recoveryCode || !newPassword || !confirmNewPassword) {
      setError("Preencha o código e a nova senha.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    const result = await resetPassword(recoveryCode, newPassword);
    if (result.success) {
      setSuccessMsg("Senha redefinida com sucesso! Você já pode entrar.");
      setTimeout(() => {
        setMode("login");
        setRecoveryStep(1);
        setEmail("");
        setPassword("");
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  const handleTwoFactor = async () => {
    resetForm();
    if (twoFactorCode.length !== 6) {
      setError("Informe o código de 6 dígitos do autenticador.");
      return;
    }
    const result = await login(email, password, twoFactorCode);
    if (result.success) {
      router.replace("/(tabs)/dashboard");
    } else {
      setError(result.message || "Código inválido.");
    }
  };

  const handleSubmit = () => {
    if (mode === "login") handleLogin();
    else if (mode === "signup") handleSignup();
    else if (mode === "recovery") {
      if (recoveryStep === 1) handleRequestRecovery();
      else handleResetPassword();
    } else if (mode === "twoFactor") handleTwoFactor();
  };

  const getTitle = () => {
    if (mode === "recovery") return "Recuperar Conta";
    if (mode === "twoFactor") return "Segurança";
    if (mode === "signup") return "Criar Conta";
    return "Bem-vindo";
  };

  const renderInput = (Icon: any, value: string, onChange: (t: string) => void, placeholder: string, isPassword = false, keyboardType: any = "default", maxLength?: number) => (
    <View className="mb-4">
      <View className="flex-row items-center bg-brand-gray dark:bg-brand-dark/50 rounded-3xl border border-brand-gray/20 dark:border-brand-dark px-4 py-1">
        <View className="w-10 h-10 items-center justify-center">
          <Icon size={20} color={isDark ? "#F5F5F540" : "#00000030"} />
        </View>
        <TextInput
          className="flex-1 h-12 text-brand-dark dark:text-white font-bold text-sm"
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#F5F5F520" : "#00000020"}
          value={value}
          onChangeText={onChange}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize="none"
          maxLength={maxLength}
        />
        {isPassword && (
          <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-gray dark:bg-black">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          {/* Logo Section */}
          <View className="items-center mt-12 mb-16">
            <View className="w-24 h-24 bg-brand-green rounded-[32px] items-center justify-center shadow-2xl shadow-brand-green/40 rotate-12">
               <View className="-rotate-12">
                  <Text className="text-white font-black text-3xl">SOS</Text>
               </View>
            </View>
            <View className="mt-8 items-center">
               <Text className="text-4xl font-black text-brand-dark dark:text-white tracking-tighter">Controle</Text>
               <View className="flex-row items-center gap-2.5 mt-2">
                  <Sparkles size={16} color="#11C76F" />
                  <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.4em]">Inteligência Financeira</Text>
               </View>
            </View>
          </View>

          {/* Auth Card */}
          <View className="bg-white dark:bg-brand-dark p-10 rounded-[60px] border border-brand-gray/10 dark:border-brand-dark/50 shadow-2xl shadow-black/5">
            <View className="mb-10">
              <Text className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">{getTitle()}</Text>
              <Text className="text-[10px] font-black text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-[0.3em] mt-2">
                {mode === 'login' ? 'Acesse sua conta' : mode === 'signup' ? 'Comece agora' : 'Siga as instruções'}
              </Text>
            </View>

            {error ? (
              <View className="flex-row items-center bg-red-50 dark:bg-red-900/10 p-5 rounded-[24px] border border-red-100 dark:border-red-900/20 mb-8">
                <AlertTriangle size={20} color="#EF4444" />
                <Text className="flex-1 ml-4 text-red-600 font-black text-xs">{error}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View className="flex-row items-center bg-brand-green/5 dark:bg-brand-green/10 p-5 rounded-[24px] border border-brand-green/10 dark:border-brand-green/20 mb-8">
                <Check size={20} color="#11C76F" />
                <Text className="flex-1 ml-4 text-brand-green font-black text-xs">{successMsg}</Text>
              </View>
            ) : null}

            {mode === "twoFactor" ? (
              <View>
                <View className="items-center mb-8">
                  <View className="w-20 h-20 bg-brand-green/10 rounded-[30px] items-center justify-center border border-brand-green/20">
                    <ShieldCheck size={48} color="#11C76F" />
                  </View>
                </View>
                <TextInput
                  className="bg-brand-gray dark:bg-brand-dark/50 rounded-[30px] border border-brand-gray/20 dark:border-brand-dark p-8 text-4xl font-black text-brand-dark dark:text-white text-center tracking-[12px] mb-8"
                  placeholder="000000"
                  placeholderTextColor={isDark ? "#F5F5F520" : "#00000020"}
                  value={twoFactorCode}
                  onChangeText={(t) => setTwoFactorCode(t.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity 
                  className="bg-brand-green h-20 rounded-[30px] items-center justify-center shadow-2xl shadow-brand-green/40"
                  onPress={handleTwoFactor} 
                  disabled={isLoading || twoFactorCode.length !== 6}
                >
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black text-base uppercase tracking-[0.2em]">Verificar</Text>}
                </TouchableOpacity>
              </View>
            ) : mode === "recovery" ? (
              <View>
                {recoveryStep === 1 ? (
                  <>
                    {renderInput(Mail, email, setEmail, "Seu e-mail", false, "email-address")}
                    <TouchableOpacity 
                      className="bg-brand-green h-20 rounded-[30px] items-center justify-center shadow-2xl shadow-brand-green/40 mt-6"
                      onPress={handleRequestRecovery} 
                      disabled={isLoading}
                    >
                      {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black text-base uppercase tracking-[0.2em]">Enviar Código</Text>}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {renderInput(Lock, recoveryCode, setRecoveryCode, "Código de 6 dígitos", false, "numeric", 6)}
                    {renderInput(Lock, newPassword, setNewPassword, "Nova Senha", true)}
                    {renderInput(Lock, confirmNewPassword, setConfirmNewPassword, "Confirmar Senha", true)}
                    <TouchableOpacity 
                      className="bg-brand-green h-20 rounded-[30px] items-center justify-center shadow-2xl shadow-brand-green/40 mt-6"
                      onPress={handleResetPassword} 
                      disabled={isLoading}
                    >
                      {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black text-base uppercase tracking-[0.2em]">Redefinir Senha</Text>}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <View>
                {mode === "signup" && renderInput(User, name, setName, "Nome Completo")}
                {renderInput(Mail, email, setEmail, "E-mail", false, "email-address")}
                {mode === "signup" && renderInput(Smartphone, phone, handlePhoneChange, "WhatsApp", false, "phone-pad", 15)}
                {renderInput(Lock, password, setPassword, "Senha", true)}
                {mode === "signup" && renderInput(Lock, confirmPassword, setConfirmPassword, "Confirmar Senha", true)}

                {mode === "login" && (
                  <View className="flex-row justify-between items-center mb-8 px-4">
                    <TouchableOpacity className="flex-row items-center gap-3" onPress={() => setRememberMe(!rememberMe)}>
                      <View className={`w-6 h-6 rounded-[8px] border-2 items-center justify-center ${rememberMe ? 'bg-brand-green border-brand-green' : 'border-brand-gray dark:border-brand-dark'}`}>
                        {rememberMe && <Check size={14} color="#fff" strokeWidth={4} />}
                      </View>
                      <Text className="text-brand-dark/30 dark:text-brand-gray/30 font-black text-[10px] uppercase tracking-[0.2em]">Lembrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { resetForm(); setMode("recovery"); }}>
                      <Text className="text-brand-green font-black text-[10px] uppercase tracking-[0.2em]">Esqueceu?</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  className="bg-brand-green h-20 rounded-[30px] items-center justify-center shadow-2xl shadow-brand-green/40 mt-6"
                  onPress={handleSubmit} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View className="flex-row items-center gap-3">
                       <Text className="text-white font-black text-base uppercase tracking-[0.2em]">
                         {mode === "signup" ? "Criar Conta" : "Entrar"}
                       </Text>
                       <ArrowRight size={20} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              className="mt-10 items-center" 
              onPress={() => { resetForm(); setMode(mode === "login" ? "signup" : "login"); }}
            >
              <Text className="text-brand-dark/30 dark:text-brand-gray/30 font-black text-[10px] uppercase tracking-[0.2em]">
                {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
                <Text className="text-brand-green">
                  {mode === "login" ? "Cadastre-se" : "Faça Login"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features Bento */}
          <View className="mt-16 gap-5">
             <View className="bg-white dark:bg-brand-dark p-8 rounded-[40px] border border-brand-gray/10 dark:border-brand-dark/50 flex-row items-center gap-5 shadow-sm">
                <View className="w-14 h-14 bg-brand-green/10 rounded-[20px] items-center justify-center border border-brand-green/20">
                   <Zap size={28} color="#11C76F" />
                </View>
                <View className="flex-1">
                   <Text className="text-brand-dark dark:text-white font-black text-lg tracking-tight">Automação Bancária</Text>
                   <Text className="text-[10px] font-bold text-brand-dark/30 dark:text-brand-gray/30 uppercase tracking-tighter">Categorização inteligente de gastos</Text>
                </View>
             </View>

             <View className="bg-brand-dark p-8 rounded-[40px] flex-row items-center gap-5 shadow-2xl shadow-black/20">
                <View className="w-14 h-14 bg-white/10 rounded-[20px] items-center justify-center border border-white/10">
                   <ShieldCheck size={28} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                   <Text className="text-white font-black text-lg tracking-tight">Segurança Nível Bancário</Text>
                   <Text className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Seus dados protegidos com criptografia</Text>
                </View>
             </View>
          </View>

          {/* Footer */}
          <View className="mt-20 items-center">
             <View className="flex-row items-center gap-8 mb-10">
                <TouchableOpacity onPress={() => setActiveModal("privacy")}>
                   <Text className="text-brand-dark/30 dark:text-brand-gray/30 font-black text-[10px] uppercase tracking-[0.3em]">Privacidade</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveModal("security")}>
                   <Text className="text-brand-dark/30 dark:text-brand-gray/30 font-black text-[10px] uppercase tracking-[0.3em]">Segurança</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveModal("help")}>
                   <Text className="text-brand-dark/30 dark:text-brand-gray/30 font-black text-[10px] uppercase tracking-[0.3em]">Ajuda</Text>
                </TouchableOpacity>
             </View>
             <Text className="text-[9px] font-black text-brand-dark/20 dark:text-brand-gray/20 uppercase tracking-[0.5em]">SOS Controle © 2026</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL */}
      <Modal visible={activeModal !== null} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-center p-6">
          <View className="bg-white dark:bg-brand-dark rounded-5xl p-8 border border-brand-gray/10 dark:border-brand-dark/50">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-brand-green/10 rounded-2xl items-center justify-center">
                  {activeModal === "privacy" && <Shield size={24} color="#11C76F" />}
                  {activeModal === "security" && <ShieldCheck size={24} color="#11C76F" />}
                  {activeModal === "help" && <Info size={24} color="#11C76F" />}
                </View>
                <View>
                   <Text className="text-xl font-bold text-brand-dark dark:text-white tracking-tight">
                     {activeModal === "privacy" ? "Privacidade" : activeModal === "security" ? "Segurança" : "Ajuda"}
                   </Text>
                   <Text className="text-[9px] font-bold text-brand-dark/40 dark:text-brand-gray/40 uppercase tracking-widest">Informações Importantes</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-brand-gray dark:bg-brand-dark/50 rounded-xl">
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-brand-dark/60 dark:text-brand-gray/60 text-sm leading-6 mb-8">
              {activeModal === "privacy" 
                ? "Nosso compromisso com seus dados é total. No SOS Controle, acreditamos que sua privacidade não tem preço. Não vendemos, não alugamos e não compartilhamos suas informações pessoais ou financeiras com terceiros para fins publicitários."
                : activeModal === "security"
                ? "Sua segurança é o pilar central da nossa plataforma. Utilizamos uma infraestrutura de nível bancário para proteger seu patrimônio digital. Implementamos autenticação de dois fatores (2FA) e criptografia de ponta a ponta."
                : "Precisa de uma mãozinha? Estamos aqui para você! Nossa central de ajuda conta com tutoriais detalhados e uma equipe de suporte humanizado pronta para tirar qualquer dúvida sobre a plataforma."}
            </Text>

            <TouchableOpacity 
              className="bg-brand-gray dark:bg-brand-dark/50 h-14 rounded-2xl items-center justify-center border border-brand-gray/20 dark:border-brand-dark" 
              onPress={() => setActiveModal(null)}
            >
              <Text className="text-brand-dark dark:text-brand-gray font-bold text-xs uppercase tracking-widest">Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


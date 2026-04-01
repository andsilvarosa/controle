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
  KeyRound,
} from "lucide-react-native";

import { MainLogo } from "../components/UI/MainLogo";

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
    if (mode === "recovery") return "Recuperar conta";
    if (mode === "twoFactor") return "Segurança";
    if (mode === "signup") return "Crie sua conta grátis";
    return "Bem-vindo de volta!";
  };

  const getSubtitle = () => {
    if (mode === "recovery") return "Siga as instruções para redefinir sua senha";
    if (mode === "twoFactor") return "Confirme sua identidade para continuar";
    if (mode === "signup") return "Comece sua jornada financeira hoje mesmo";
    return "Acesse sua conta para gerenciar suas finanças";
  };

  const renderInput = (Icon: any, value: string, onChange: (t: string) => void, placeholder: string, isPassword = false, keyboardType: any = "default", maxLength?: number) => (
    <View className="mb-4 relative justify-center">
      <View className="absolute left-4 z-10">
        <Icon size={20} color={isDark ? "#9ca3af" : "#9ca3af"} />
      </View>
      <TextInput
        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-medium text-base"
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
        value={value}
        onChangeText={onChange}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize="none"
        maxLength={maxLength}
        style={{ height: 56 }}
      />
      {isPassword && (
        <TouchableOpacity className="absolute right-4 z-10" onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5] dark:bg-brand-dark" style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          {/* CARD DE AUTENTICAÇÃO "SPLIT" */}
          <View className="w-full bg-white dark:bg-[#18181b] rounded-3xl overflow-hidden flex-col border border-black/5 dark:border-white/5 shadow-2xl" style={{ elevation: 10 }}>
            
            {/* LADO ESQUERDO: BRANDING (VERDE PICPAY) */}
            <View className="w-full bg-picpay-500 p-10 relative overflow-hidden">
              <View className="relative z-10">
                <View className="flex-row items-center gap-3 mb-12">
                  <MainLogo size={48} />
                  <Text className="font-black text-2xl tracking-tighter text-white">SOS Controle</Text>
                </View>

                <Text className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
                  Seu dinheiro, {"\n"}
                  <Text className="text-picpay-100">sob controle.</Text>
                </Text>

                <Text className="text-picpay-50 text-base font-medium leading-relaxed max-w-[280px]">
                  A plataforma definitiva para gerenciar suas finanças com inteligência e simplicidade.
                </Text>
              </View>

              {/* Trust Indicators */}
              <View className="relative z-10 mt-12 pt-12 border-t border-white/20">
                <View className="flex-row items-center gap-4 mb-4">
                  <View className="flex-row">
                    {[1,2,3,4].map(i => (
                      <View key={i} className="w-10 h-10 rounded-full border-2 border-picpay-500 bg-white/20 items-center justify-center overflow-hidden -ml-3 first:ml-0">
                        <Image source={{ uri: `https://picsum.photos/seed/user${i}/100/100` }} className="w-full h-full" />
                      </View>
                    ))}
                    <View className="w-10 h-10 rounded-full border-2 border-picpay-500 bg-white items-center justify-center -ml-3">
                      <Text className="text-xs font-bold text-picpay-500">+10k</Text>
                    </View>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Sparkles key={i} size={16} color="#facc15" fill="#facc15" />
                      ))}
                    </View>
                    <Text className="text-white text-sm font-medium mt-1">Junte-se a milhares de usuários</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* LADO DIREITO: FORMULÁRIO (BRANCO/CINZA) */}
            <View className="w-full p-10 flex-col justify-center">
              
              <View className="mb-10">
                <Text className="text-2xl font-bold text-brand-dark dark:text-white mb-2">
                  {getTitle()}
                </Text>
                <Text className="text-[#a1a1aa] text-sm font-medium">
                  {getSubtitle()}
                </Text>
              </View>

              {error ? (
                <View className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex-row items-center gap-3 mb-5">
                  <AlertTriangle size={18} color="#dc2626" />
                  <Text className="flex-1 text-red-600 dark:text-red-400 text-xs font-bold">{error}</Text>
                </View>
              ) : null}

              {successMsg ? (
                <View className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex-row items-center gap-3 mb-5">
                  <Check size={18} color="#059669" />
                  <Text className="flex-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">{successMsg}</Text>
                </View>
              ) : null}

              {mode === "twoFactor" ? (
                <View className="space-y-6">
                  <View className="items-center mb-4">
                    <View className="w-16 h-16 bg-picpay-50 dark:bg-picpay-500/10 rounded-3xl items-center justify-center">
                      <ShieldCheck size={32} color="#11C76F" />
                    </View>
                  </View>
                  <TextInput
                    className="w-full px-4 py-5 bg-[#fafafa] dark:bg-[#27272a] border-2 border-transparent rounded-3xl text-[#18181b] dark:text-white font-bold text-3xl text-center mb-6"
                    style={{ letterSpacing: 6 }}
                    placeholder="000000"
                    placeholderTextColor={isDark ? "#a1a1aa" : "#a1a1aa"}
                    value={twoFactorCode}
                    onChangeText={(t) => setTwoFactorCode(t.replace(/\D/g, "").slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity 
                    className="w-full py-4 bg-picpay-500 rounded-2xl items-center justify-center shadow-lg mb-4"
                    onPress={handleTwoFactor} 
                    disabled={isLoading || twoFactorCode.length !== 6}
                  >
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Verificar Código</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMode("login")} className="items-center">
                    <Text className="text-xs font-bold text-[#a1a1aa] uppercase tracking-widest">Voltar</Text>
                  </TouchableOpacity>
                </View>
              ) : mode === "recovery" ? (
                <View className="space-y-6">
                  {recoveryStep === 1 ? (
                    <>
                      {renderInput(Mail, email, setEmail, "E-mail cadastrado", false, "email-address")}
                      <TouchableOpacity 
                        className="w-full py-4 bg-picpay-500 rounded-2xl items-center justify-center shadow-lg mt-2 mb-4"
                        onPress={handleRequestRecovery} 
                        disabled={isLoading}
                      >
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Enviar Código</Text>}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {renderInput(KeyRound, recoveryCode, setRecoveryCode, "Código", false, "numeric", 6)}
                      {renderInput(Lock, newPassword, setNewPassword, "Nova Senha", true)}
                      {renderInput(Lock, confirmNewPassword, setConfirmNewPassword, "Confirmar Nova Senha", true)}
                      <TouchableOpacity 
                        className="w-full py-4 bg-picpay-500 rounded-2xl items-center justify-center shadow-lg mt-2 mb-4"
                        onPress={handleResetPassword} 
                        disabled={isLoading}
                      >
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Redefinir Senha</Text>}
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity onPress={() => setMode("login")} className="items-center">
                    <Text className="text-xs font-bold text-[#a1a1aa] uppercase tracking-widest">Voltar ao login</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="space-y-5">
                  {mode === "signup" && renderInput(User, name, setName, "Nome completo")}
                  {renderInput(Mail, email, setEmail, "E-mail", false, "email-address")}
                  {mode === "signup" && renderInput(Smartphone, phone, handlePhoneChange, "WhatsApp / Celular", false, "phone-pad", 15)}
                  {renderInput(Lock, password, setPassword, "Senha", true)}
                  {mode === "signup" && renderInput(Lock, confirmPassword, setConfirmPassword, "Confirmar Senha", true)}

                  {mode === "login" && (
                    <View className="flex-row justify-between items-center px-2 mb-2">
                      <TouchableOpacity className="flex-row items-center gap-2.5" onPress={() => setRememberMe(!rememberMe)}>
                        <View className={`w-5 h-5 rounded-lg border-2 items-center justify-center ${rememberMe ? 'bg-picpay-500 border-picpay-500' : 'border-[#e4e4e7] dark:border-[#3f3f46]'}`}>
                          {rememberMe && <Check size={14} color="#fff" strokeWidth={3} />}
                        </View>
                        <Text className="text-xs font-bold text-[#a1a1aa]">Lembrar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { resetForm(); setMode("recovery"); }}>
                        <Text className="text-xs font-bold text-picpay-500">Esqueceu a senha?</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View className="pt-4">
                    <TouchableOpacity 
                      className="w-full py-4 bg-picpay-500 rounded-2xl items-center justify-center shadow-lg mb-4"
                      onPress={handleSubmit} 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-base">
                          {mode === "signup" ? "Criar Conta" : "Entrar"}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                      className="w-full py-4 items-center"
                      onPress={() => { resetForm(); setMode(mode === "login" ? "signup" : "login"); }}
                    >
                      <Text className="text-[#a1a1aa] font-bold uppercase tracking-widest text-[10px]">
                        {mode === "login" ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* BENTO GRID DE FUNCIONALIDADES (ABAIXO) */}
          <View className="w-full mt-16 flex-col gap-6">
            
            <View className="bg-white dark:bg-[#18181b] p-8 rounded-[40px] border border-black/5 dark:border-white/5 shadow-sm flex-col items-center gap-6">
              <View className="w-24 h-24 bg-picpay-50 dark:bg-picpay-500/10 rounded-[32px] items-center justify-center">
                <Sparkles size={48} color="#11C76F" />
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-brand-dark dark:text-white mb-2 text-center">Projeções com Inteligência Artificial</Text>
                <Text className="text-sm text-[#a1a1aa] font-medium leading-relaxed text-center">
                  Nosso algoritmo analisa seus hábitos e projeta seu saldo para os próximos meses, ajudando você a tomar decisões melhores hoje.
                </Text>
              </View>
            </View>

            <View className="bg-picpay-500 p-8 rounded-[40px] shadow-sm flex-col">
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-6">
                <ShieldCheck size={28} color="#FFFFFF" />
              </View>
              <Text className="text-xl font-bold text-white mb-2">Segurança Máxima</Text>
              <Text className="text-sm text-white/80 font-medium leading-relaxed">
                Seus dados são protegidos com criptografia de ponta e protocolos bancários.
              </Text>
            </View>

            <View className="bg-white dark:bg-[#18181b] p-8 rounded-[40px] border border-black/5 dark:border-white/5 shadow-sm">
              <View className="w-12 h-12 bg-picpay-50 dark:bg-picpay-500/10 rounded-2xl items-center justify-center mb-6">
                <Zap size={28} color="#11C76F" />
              </View>
              <Text className="text-lg font-bold text-brand-dark dark:text-white mb-2">Automação</Text>
              <Text className="text-xs text-[#a1a1aa] font-medium leading-relaxed">
                Categorização automática de lançamentos e regras inteligentes para economizar tempo.
              </Text>
            </View>

            <View className="bg-white dark:bg-[#18181b] p-8 rounded-[40px] border border-black/5 dark:border-white/5 shadow-sm flex-col gap-6">
              <View>
                <Text className="text-xl font-bold text-brand-dark dark:text-white mb-2">Relatórios Detalhados</Text>
                <Text className="text-sm text-[#a1a1aa] font-medium leading-relaxed">
                  Visualize sua evolução financeira com gráficos interativos e insights poderosos sobre seu comportamento de consumo.
                </Text>
              </View>
              <View className="w-full h-32 bg-[#fafafa] dark:bg-[#27272a] rounded-3xl overflow-hidden relative border border-black/5 dark:border-white/5">
                <View className="absolute left-4 right-4 bottom-0 h-24 flex-row items-end gap-2">
                  {[40, 70, 45, 90, 60, 85, 50].map((h, i) => (
                    <View key={i} className="flex-1 bg-picpay-500 rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </View>
              </View>
            </View>

          </View>

          {/* FOOTER */}
          <View className="mt-20 pb-12 w-full flex-col items-center gap-6">
            <View className="flex-row items-center gap-3">
              <View className="w-5 h-5 bg-[#a1a1aa] rounded items-center justify-center">
                <Text className="text-white font-black text-[8px]">SOS</Text>
              </View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">SOS Controle © 2024</Text>
            </View>
            <View className="flex-row items-center gap-8">
              <TouchableOpacity onPress={() => setActiveModal("privacy")}>
                <Text className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest">Privacidade</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveModal("security")}>
                <Text className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest">Segurança</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveModal("help")}>
                <Text className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest">Ajuda</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL */}
      <Modal visible={activeModal !== null} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center p-4">
          <View className="w-full bg-white dark:bg-[#18181b] rounded-[32px] p-8 border border-black/5 dark:border-white/5 shadow-2xl">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center gap-4">
                <View className="p-3 bg-picpay-50 dark:bg-picpay-500/10 rounded-2xl">
                  {activeModal === "privacy" && <Shield size={24} color="#11C76F" />}
                  {activeModal === "security" && <ShieldCheck size={24} color="#11C76F" />}
                  {activeModal === "help" && <Info size={24} color="#11C76F" />}
                </View>
                <View>
                   <Text className="text-xl font-bold text-brand-dark dark:text-white">
                     {activeModal === "privacy" ? "Privacidade e Dados" : activeModal === "security" ? "Segurança e Proteção" : "Central de Ajuda"}
                   </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-[#f4f4f5] dark:bg-[#27272a] rounded-xl">
                <X size={20} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-[#71717a] dark:text-[#a1a1aa] text-sm leading-6 mb-8 font-medium">
              {activeModal === "privacy" 
                ? "Nosso compromisso com seus dados é total. No SOS Controle, acreditamos que sua privacidade não tem preço.\n\nNão vendemos, não alugamos e não compartilhamos suas informações pessoais ou financeiras com terceiros para fins publicitários.\n\nOperamos em total conformidade com a LGPD (Lei Geral de Proteção de Dados), garantindo que você tenha controle total sobre seus dados e a transparência necessária sobre como eles são utilizados para melhorar sua experiência."
                : activeModal === "security"
                ? "Sua segurança é o pilar central da nossa plataforma. Utilizamos uma infraestrutura de nível bancário para proteger seu patrimônio digital.\n\nNossa estrutura conta com travas robustas contra ataques de força bruta e sistemas de detecção de intrusão em tempo real.\n\nImplementamos validação rigorosa em todas as camadas, autenticação de dois fatores (2FA) e criptografia de ponta a ponta, garantindo que apenas você tenha acesso às suas informações sensíveis."
                : "Precisa de uma mãozinha? Estamos aqui para você!\n\nNossa central de ajuda conta com tutoriais detalhados e uma equipe de suporte humanizado pronta para tirar qualquer dúvida sobre a plataforma.\n\nVocê pode entrar em contato conosco pelo e-mail suporte@sostec.top ou através do chat disponível dentro do seu painel de controle após o login."}
            </Text>

            <TouchableOpacity 
              className="w-full py-4 bg-[#f4f4f5] dark:bg-[#27272a] rounded-2xl items-center justify-center" 
              onPress={() => setActiveModal(null)}
            >
              <Text className="text-[#52525b] dark:text-[#d4d4d8] font-bold text-xs uppercase tracking-widest">Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


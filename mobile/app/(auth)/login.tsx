import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react-native";
import { useFinanceStore } from "../../src/store/useFinanceStore";

const SAVED_EMAIL_KEY = "sos_saved_email";
const SAVED_PASSWORD_KEY = "sos_saved_password";

type AuthInputProps = TextInputProps & {
  icon: any;
  trailing?: ReactNode;
};

function FeaturePill({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <View className="rounded-[24px] border border-white/15 bg-white/10 p-4">
      <View className="mb-3 h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
        <Icon size={22} color="#ffffff" />
      </View>
      <Text className="text-sm font-bold text-white">{title}</Text>
      <Text className="mt-1 text-xs leading-5 text-white/75">{description}</Text>
    </View>
  );
}

function StatusBanner({
  kind,
  message,
}: {
  kind: "error" | "success";
  message: string;
}) {
  const isError = kind === "error";

  return (
    <View
      className={`mb-5 flex-row items-center rounded-[22px] border px-4 py-3 ${
        isError ? "border-red-100 bg-red-50" : "border-emerald-100 bg-emerald-50"
      }`}
    >
      <View className="mr-3">
        {isError ? <AlertTriangle size={18} color="#dc2626" /> : <Check size={18} color="#059669" />}
      </View>
      <Text className={`flex-1 text-xs font-bold leading-5 ${isError ? "text-red-600" : "text-emerald-600"}`}>
        {message}
      </Text>
    </View>
  );
}

function AuthInput({ icon: Icon, trailing, ...props }: AuthInputProps) {
  return (
    <View className="relative mb-4">
      <View className="absolute bottom-0 left-4 top-0 z-10 justify-center">
        <Icon size={20} color="#9ca3af" />
      </View>
      <TextInput
        placeholderTextColor="#9ca3af"
        className="rounded-[28px] border border-gray-200 bg-gray-50 px-12 py-4 text-base font-semibold text-gray-900"
        {...props}
      />
      {trailing ? <View className="absolute bottom-0 right-4 top-0 z-10 justify-center">{trailing}</View> : null}
    </View>
  );
}

export default function Login() {
  const { login, signup, forgotPassword, resetPassword, isLoading } = useFinanceStore();

  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadSavedCredentials() {
      try {
        const [savedEmail, savedPassword] = await Promise.all([
          SecureStore.getItemAsync(SAVED_EMAIL_KEY),
          SecureStore.getItemAsync(SAVED_PASSWORD_KEY),
        ]);

        if (savedEmail) {
          setFormData((prev) => ({
            ...prev,
            email: savedEmail,
            password: savedPassword || "",
          }));
          setRememberMe(true);
        }
      } catch (e) {}
    }

    loadSavedCredentials();
  }, []);

  const clearFeedback = () => {
    setError("");
    setSuccessMsg("");
  };

  const persistRememberedCredentials = async () => {
    try {
      if (rememberMe) {
        await Promise.all([
          SecureStore.setItemAsync(SAVED_EMAIL_KEY, formData.email),
          SecureStore.setItemAsync(SAVED_PASSWORD_KEY, formData.password),
        ]);
      } else {
        await Promise.all([
          SecureStore.deleteItemAsync(SAVED_EMAIL_KEY),
          SecureStore.deleteItemAsync(SAVED_PASSWORD_KEY),
        ]);
      }
    } catch (e) {}
  };

  const resetTwoFactorState = () => {
    setRequire2FA(false);
    setTwoFactorCode("");
  };

  const resetRecoveryState = () => {
    setIsRecovery(false);
    setRecoveryStep(1);
    setRecoveryEmail("");
    setRecoveryCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const switchToLogin = () => {
    clearFeedback();
    resetTwoFactorState();
    resetRecoveryState();
    setIsLogin(true);
  };

  const handlePhoneChange = (value: string) => {
    let formatted = value.replace(/\D/g, "");
    if (formatted.length > 11) formatted = formatted.slice(0, 11);
    if (formatted.length > 2) formatted = `(${formatted.slice(0, 2)}) ${formatted.slice(2)}`;
    if (formatted.length > 10) formatted = `${formatted.slice(0, 10)}-${formatted.slice(10)}`;
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleLoginSubmit = async () => {
    clearFeedback();

    if (require2FA) {
      if (twoFactorCode.length !== 6) {
        setError("Informe o codigo de 6 digitos do autenticador.");
        return;
      }

      const result = await login(formData.email, formData.password, twoFactorCode);
      if (result.success) {
        await persistRememberedCredentials();
        resetTwoFactorState();
      } else {
        setError(result.message || "Codigo invalido.");
      }
      return;
    }

    if (!formData.email || !formData.password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      await persistRememberedCredentials();
      return;
    }

    if (result.require2fa) {
      setRequire2FA(true);
      setTwoFactorCode("");
      return;
    }

    setError(result.message || "Credenciais invalidas.");
  };

  const handleSignupSubmit = async () => {
    clearFeedback();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Preencha todos os campos para criar sua conta.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    const result = await signup({ ...formData, avatar: "icon:User:teal" });
    if (!result.success) {
      setError(result.message || "Erro ao criar conta.");
    }
  };

  const handleRequestCode = async () => {
    clearFeedback();
    if (!recoveryEmail) {
      setError("Informe o e-mail cadastrado.");
      return;
    }

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

  const handleResetSubmit = async () => {
    clearFeedback();

    if (!recoveryCode || !newPassword || !confirmNewPassword) {
      setError("Preencha o codigo e a nova senha.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("As senhas nao coincidem. Verifique e tente novamente.");
      return;
    }

    setIsProcessing(true);
    const result = await resetPassword(recoveryCode, newPassword);
    setIsProcessing(false);

    if (result.success) {
      setSuccessMsg("Senha redefinida com sucesso! Voce ja pode entrar.");
      setTimeout(() => {
        setSuccessMsg("");
        setIsLogin(true);
        resetRecoveryState();
      }, 1800);
    } else {
      setError(result.message);
    }
  };

  const title = isRecovery ? "Recuperar conta" : require2FA ? "Seguranca" : isLogin ? "Bem-vindo de volta!" : "Crie sua conta gratis";
  const subtitle = isRecovery
    ? "Siga as instrucoes para redefinir sua senha"
    : require2FA
      ? "Confirme sua identidade para continuar"
      : isLogin
        ? "Acesse sua conta para gerenciar suas financas"
        : "Comece sua jornada financeira hoje mesmo";

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-4 py-4">
            <View className="overflow-hidden rounded-[36px] border border-black/5 bg-white">
              <View className="bg-teal-600 px-6 pb-7 pt-8">
                <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-white/15">
                  <Wallet size={32} color="#ffffff" />
                </View>

                <Text className="mt-6 text-3xl font-bold text-white">SOS Controle</Text>
                <Text className="mt-2 text-sm leading-6 text-white/80">
                  Seu controle financeiro com regras inteligentes, seguranca em camadas e uma experiencia pensada para o dia a dia.
                </Text>

                <View className="mt-6 gap-3">
                  <FeaturePill
                    icon={ShieldCheck}
                    title="Seguranca em primeiro lugar"
                    description="Login protegido com sessao validada no servidor e suporte a autenticacao em dois fatores."
                  />
                  <FeaturePill
                    icon={TrendingUp}
                    title="Visao clara do seu dinheiro"
                    description="Acompanhe saldos, metas e transacoes em uma rotina de controle simples e confiavel."
                  />
                  <FeaturePill
                    icon={Sparkles}
                    title="Automacao util"
                    description="Categorias, regras e organizacao inspiradas no fluxo completo da versao web."
                  />
                </View>
              </View>

              <View className="bg-white px-5 pb-8 pt-6">
                <View className="mb-6">
                  <Text className="text-[28px] font-bold text-gray-900">{title}</Text>
                  <Text className="mt-2 text-sm font-medium leading-6 text-gray-400">{subtitle}</Text>
                </View>

                {error ? <StatusBanner kind="error" message={error} /> : null}
                {successMsg ? <StatusBanner kind="success" message={successMsg} /> : null}

                {require2FA ? (
                  <View>
                    <View className="mb-6 items-center">
                      <View className="mb-4 h-16 w-16 items-center justify-center rounded-[24px] bg-teal-50">
                        <ShieldCheck size={32} color="#0f766e" />
                      </View>
                      <Text className="text-center text-sm font-medium leading-6 text-gray-500">
                        Digite o codigo de 6 digitos gerado no seu aplicativo autenticador para concluir o acesso.
                      </Text>
                    </View>

                    <AuthInput
                      icon={KeyRound}
                      value={twoFactorCode}
                      onChangeText={(value) => setTwoFactorCode(value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      keyboardType="number-pad"
                      autoFocus
                      maxLength={6}
                      style={{ letterSpacing: 12, textAlign: "center", fontSize: 26 }}
                    />

                    <TouchableOpacity
                      activeOpacity={0.9}
                      className={`mt-2 items-center rounded-[28px] bg-teal-600 py-4 ${isLoading || twoFactorCode.length !== 6 ? "opacity-60" : ""}`}
                      disabled={isLoading || twoFactorCode.length !== 6}
                      onPress={handleLoginSubmit}
                    >
                      {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-sm font-bold uppercase tracking-[0.22em] text-white">Verificar codigo</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="mt-4 items-center py-2"
                      onPress={() => {
                        resetTwoFactorState();
                        clearFeedback();
                      }}
                    >
                      <Text className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Voltar</Text>
                    </TouchableOpacity>
                  </View>
                ) : isRecovery ? (
                  <View>
                    {recoveryStep === 1 ? (
                      <AuthInput
                        icon={Mail}
                        value={recoveryEmail}
                        onChangeText={setRecoveryEmail}
                        placeholder="E-mail cadastrado"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    ) : (
                      <>
                        <AuthInput
                          icon={KeyRound}
                          value={recoveryCode}
                          onChangeText={(value) => setRecoveryCode(value.trim())}
                          placeholder="Codigo ou token"
                          autoCapitalize="none"
                        />
                        <AuthInput
                          icon={Lock}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Nova senha"
                          secureTextEntry
                          autoCapitalize="none"
                        />
                        <AuthInput
                          icon={Lock}
                          value={confirmNewPassword}
                          onChangeText={setConfirmNewPassword}
                          placeholder="Confirmar nova senha"
                          secureTextEntry
                          autoCapitalize="none"
                        />
                      </>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.9}
                      className={`mt-2 items-center rounded-[28px] bg-teal-600 py-4 ${isProcessing ? "opacity-60" : ""}`}
                      disabled={isProcessing}
                      onPress={recoveryStep === 1 ? handleRequestCode : handleResetSubmit}
                    >
                      {isProcessing ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text className="text-sm font-bold uppercase tracking-[0.22em] text-white">
                          {recoveryStep === 1 ? "Enviar codigo" : "Redefinir senha"}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8} className="mt-4 items-center py-2" onPress={switchToLogin}>
                      <Text className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Voltar ao login</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    {!isLogin ? (
                      <AuthInput
                        icon={User}
                        value={formData.name}
                        onChangeText={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                        placeholder="Nome completo"
                      />
                    ) : null}

                    <AuthInput
                      icon={Mail}
                      value={formData.email}
                      onChangeText={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                      placeholder="E-mail"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />

                    {!isLogin ? (
                      <AuthInput
                        icon={Smartphone}
                        value={formData.phone}
                        onChangeText={handlePhoneChange}
                        placeholder="WhatsApp / Celular"
                        keyboardType="phone-pad"
                      />
                    ) : null}

                    <AuthInput
                      icon={Lock}
                      value={formData.password}
                      onChangeText={(value) => setFormData((prev) => ({ ...prev, password: value }))}
                      placeholder="Senha"
                      autoCapitalize="none"
                      autoComplete={isLogin ? "password" : "new-password"}
                      secureTextEntry={!showPassword}
                      trailing={
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                        </TouchableOpacity>
                      }
                    />

                    {!isLogin ? (
                      <AuthInput
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChangeText={(value) => setFormData((prev) => ({ ...prev, confirmPassword: value }))}
                        placeholder="Confirmar senha"
                        autoCapitalize="none"
                        secureTextEntry={!showPassword}
                      />
                    ) : null}

                    {isLogin ? (
                      <View className="mb-2 mt-1 flex-row items-center justify-between px-1">
                        <TouchableOpacity
                          activeOpacity={0.8}
                          className="flex-row items-center"
                          onPress={() => setRememberMe((prev) => !prev)}
                        >
                          <View
                            className={`mr-2 h-5 w-5 items-center justify-center rounded-lg border ${rememberMe ? "border-teal-600 bg-teal-600" : "border-gray-300 bg-white"}`}
                          >
                            {rememberMe ? <Check size={14} color="#ffffff" /> : null}
                          </View>
                          <Text className="text-xs font-bold text-gray-400">Lembrar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            clearFeedback();
                            setIsRecovery(true);
                            setRecoveryStep(1);
                            setRecoveryEmail(formData.email);
                          }}
                        >
                          <Text className="text-xs font-bold text-teal-600">Esqueceu a senha?</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      activeOpacity={0.9}
                      className={`mt-6 items-center rounded-[28px] bg-teal-600 py-4 ${isLoading ? "opacity-60" : ""}`}
                      disabled={isLoading}
                      onPress={isLogin ? handleLoginSubmit : handleSignupSubmit}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text className="text-sm font-bold uppercase tracking-[0.22em] text-white">
                          {isLogin ? "Entrar" : "Criar conta"}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="mt-4 items-center py-2"
                      onPress={() => {
                        clearFeedback();
                        setIsLogin((prev) => !prev);
                        setIsRecovery(false);
                      }}
                    >
                      <Text className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        {isLogin ? "Nao tem uma conta? Cadastre-se" : "Ja tem uma conta? Faca login"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View className="mt-6 rounded-[28px] border border-black/5 bg-white px-5 py-4">
              <Text className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Experiencia inspirada na versao web</Text>
              <Text className="mt-2 text-center text-sm font-medium leading-6 text-gray-500">
                Mesmo fluxo de autenticacao, mesmas regras de sessao e a mesma linguagem visual, agora otimizada para toque e leitura no celular.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

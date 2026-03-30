import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFinanceStore } from "../../src/store/useFinanceStore";
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
  LayoutDashboard,
  Shield,
  Info,
  X,
} from "lucide-react-native";

const COLORS = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  background: "#f5f5f5",
  card: "#ffffff",
  text: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  error: "#dc2626",
  errorBg: "#fef2f2",
  success: "#059669",
  successBg: "#ecfdf5",
};

type AuthMode = "login" | "signup" | "recovery" | "twoFactor";
type RecoveryStep = 1 | 2;
type ModalType = "privacy" | "security" | "help" | null;

export default function Login() {
  const router = useRouter();
  const { login, signup, forgotPassword, resetPassword, isLoading } = useFinanceStore();

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

  useEffect(() => {
    const params = new URLSearchParams(window.location?.search || "");
    const token = params.get("token");
    if (token) {
      setRecoveryCode(token);
      setMode("recovery");
      setRecoveryStep(2);
    }
  }, []);

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
    const result = await signup({ name, email, phone, password, avatar: "icon:User:teal" });
    if (!result.success) {
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

  const renderIconInput = (Icon: any, value: string, onChange: (t: string) => void, placeholder: string, props: any = {}) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputIcon}>
        <Icon size={20} color={COLORS.textMuted} />
      </View>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        {...props}
      />
    </View>
  );

  const renderForm = () => {
    if (mode === "twoFactor") {
      return (
        <View style={styles.formSection}>
          <View style={styles.twoFactorIcon}>
            <ShieldCheck size={32} color={COLORS.primary} />
          </View>
          <TextInput
            style={styles.twoFactorInput}
            placeholder="000000"
            placeholderTextColor={COLORS.textMuted}
            value={twoFactorCode}
            onChangeText={(t) => setTwoFactorCode(t.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleTwoFactor} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verificar Código</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => { resetForm(); setMode("login"); }}>
            <Text style={styles.linkButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mode === "recovery") {
      return (
        <View style={styles.formSection}>
          {recoveryStep === 1 ? (
            <>
              {renderIconInput(Mail, email, setEmail, "E-mail cadastrado", { keyboardType: "email-address", autoCapitalize: "none" })}
              <TouchableOpacity style={styles.primaryButton} onPress={handleRequestRecovery} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enviar Código</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {renderIconInput(Lock, recoveryCode, setRecoveryCode, "Código")}
              {renderIconInput(Lock, newPassword, setNewPassword, "Nova Senha", { secureTextEntry: !showPassword })}
              {renderIconInput(Lock, confirmNewPassword, setConfirmNewPassword, "Confirmar Nova Senha", { secureTextEntry: !showPassword })}
              <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Redefinir Senha</Text>}
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.linkButton} onPress={() => { resetForm(); setMode("login"); setRecoveryStep(1); }}>
            <Text style={styles.linkButtonText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.formSection}>
        {mode === "signup" && renderIconInput(User, name, setName, "Nome completo")}
        {renderIconInput(Mail, email, setEmail, "E-mail", { keyboardType: "email-address", autoCapitalize: "none" })}
        {mode === "signup" && renderIconInput(Smartphone, phone, handlePhoneChange, "WhatsApp / Celular", { keyboardType: "phone-pad" })}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Lock size={20} color={COLORS.textMuted} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.inputTrailing} onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} color={COLORS.textMuted} /> : <Eye size={20} color={COLORS.textMuted} />}
          </TouchableOpacity>
        </View>
        {mode === "signup" && (
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Lock size={20} color={COLORS.textMuted} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>
        )}
        {mode === "login" && (
          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Check size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Lembrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { resetForm(); setMode("recovery"); }}>
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{mode === "signup" ? "Criar Conta" : "Entrar"}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => { resetForm(); setMode(mode === "login" ? "signup" : "login"); }}>
          <Text style={styles.linkButtonText}>
            {mode === "login" ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>SOS</Text>
            </View>
            <Text style={styles.brandName}>Controle</Text>
            <Text style={styles.headline}>Sua vida financeira{'\n'}em um só lugar.</Text>
            <Text style={styles.subheadline}>Gerencie seus gastos, planeje seu futuro e alcance seus objetivos com inteligência.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{getTitle()}</Text>
              <Text style={styles.cardSubtitle}>{getSubtitle()}</Text>
            </View>

            {error ? (
              <View style={styles.alertBanner}>
                <AlertTriangle size={18} color={COLORS.error} />
                <Text style={styles.alertText}>{error}</Text>
              </View>
            ) : null}
            {successMsg ? (
              <View style={[styles.alertBanner, styles.alertSuccess]}>
                <Check size={18} color={COLORS.success} />
                <Text style={[styles.alertText, styles.alertTextSuccess]}>{successMsg}</Text>
              </View>
            ) : null}

            {renderForm()}
          </View>

          <View style={styles.features}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Sparkles size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitle}>Projeções com IA</Text>
              <Text style={styles.featureDesc}>Nosso algoritmo analisa seus hábitos e projeta seu saldo para os próximos meses.</Text>
            </View>

            <View style={[styles.featureCard, styles.featureCardPrimary]}>
              <View style={[styles.featureIcon, styles.featureIconPrimary]}>
                <Shield size={24} color="#fff" />
              </View>
              <Text style={[styles.featureTitle, styles.featureTitlePrimary]}>Segurança Máxima</Text>
              <Text style={[styles.featureDesc, styles.featureDescPrimary]}>Seus dados são protegidos com criptografia de ponta e protocolos bancários.</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Zap size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitle}>Automação</Text>
              <Text style={styles.featureDesc}>Categorização automática e regras inteligentes para economizar tempo.</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setActiveModal("privacy")}>
              <Text style={styles.footerLink}>Privacidade</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveModal("security")}>
              <Text style={styles.footerLink}>Segurança</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveModal("help")}>
              <Text style={styles.footerLink}>Ajuda</Text>
            </TouchableOpacity>
            <Text style={styles.copyright}>© 2024 SOS Controle</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={activeModal !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIcon}>
                  {activeModal === "privacy" && <Shield size={24} color={COLORS.primary} />}
                  {activeModal === "security" && <ShieldCheck size={24} color={COLORS.primary} />}
                  {activeModal === "help" && <Info size={24} color={COLORS.primary} />}
                </View>
                <Text style={styles.modalTitle}>
                  {activeModal === "privacy" && "Privacidade e Dados"}
                  {activeModal === "security" && "Segurança e Proteção"}
                  {activeModal === "help" && "Central de Ajuda"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.modalClose}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              {activeModal === "privacy" && "No SOS Controle, a privacidade dos seus dados é tratada como prioridade. Suas informações pessoais e financeiras não são vendidas, alugadas nem compartilhadas com terceiros para publicidade. Atuamos em conformidade com a LGPD, com transparência e controle total dos seus dados."}
              {activeModal === "security" && "A segurança é um dos pilares da plataforma, com infraestrutura de nível bancário para proteger suas informações. O sistema inclui proteção contra força bruta, detecção de intrusão em tempo real, validação em todas as camadas, 2FA e criptografia de ponta a ponta. Assim, apenas você pode acessar seus dados sensíveis."}
              {activeModal === "help" && "Precisa de uma mãozinha? Estamos aqui para você! Nossa central de ajuda conta com tutoriais detalhados e uma equipe de suporte humanizada pronta para tirar qualquer dúvida sobre a plataforma. Você pode entrar em contato pelo e-mail suporte@sostec.top ou através do chat disponível dentro do seu painel de controle após o login."}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 24, paddingTop: 20 },
  logoBadge: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { fontSize: 22, fontWeight: "900", color: "#fff" },
  brandName: { fontSize: 24, fontWeight: "900", color: COLORS.text, marginBottom: 16 },
  headline: { fontSize: 26, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: 8, lineHeight: 32 },
  subheadline: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", maxWidth: 280 },
  card: { backgroundColor: COLORS.card, borderRadius: 32, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  cardHeader: { marginBottom: 20 },
  cardTitle: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: COLORS.textSecondary },
  alertBanner: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.errorBg, padding: 12, borderRadius: 16, marginBottom: 16 },
  alertSuccess: { backgroundColor: COLORS.successBg },
  alertText: { flex: 1, marginLeft: 10, fontSize: 13, fontWeight: "600", color: COLORS.error },
  alertTextSuccess: { color: COLORS.success },
  formSection: {},
  inputContainer: { position: "relative", marginBottom: 14 },
  inputIcon: { position: "absolute", left: 16, top: 0, bottom: 0, justifyContent: "center", zIndex: 1 },
  input: { backgroundColor: "#f3f4f6", borderRadius: 20, paddingVertical: 16, paddingLeft: 48, paddingRight: 48, fontSize: 16, fontWeight: "500", color: COLORS.text },
  inputMultiline: { minHeight: 100, textAlignVertical: "top", paddingTop: 16 },
  inputTrailing: { position: "absolute", right: 16, top: 0, bottom: 0, justifyContent: "center", zIndex: 1 },
  twoFactorIcon: { alignItems: "center", marginBottom: 16 },
  twoFactorInput: { backgroundColor: "#f3f4f6", borderRadius: 20, paddingVertical: 20, fontSize: 32, fontWeight: "700", color: COLORS.text, textAlign: "center", letterSpacing: 12, marginBottom: 20 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingHorizontal: 4 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, marginRight: 8, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: 13, color: COLORS.textSecondary },
  linkText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 20, paddingVertical: 18, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 1 },
  linkButton: { paddingVertical: 16, alignItems: "center" },
  linkButtonText: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  features: { marginTop: 24, gap: 12 },
  featureCard: { backgroundColor: COLORS.card, borderRadius: 24, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureCardPrimary: { backgroundColor: COLORS.primary },
  featureIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#f0fdfa", alignItems: "center", justifyContent: "center", marginRight: 14 },
  featureIconPrimary: { backgroundColor: "rgba(255,255,255,0.2)" },
  featureTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  featureTitlePrimary: { color: "#fff" },
  featureDesc: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  featureDescPrimary: { color: "rgba(255,255,255,0.8)" },
  footer: { marginTop: 32, alignItems: "center", gap: 12 },
  footerLink: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600", letterSpacing: 1 },
  copyright: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: COLORS.card, borderRadius: 24, padding: 24, maxWidth: 400 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  modalTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  modalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f0fdfa", alignItems: "center", justifyContent: "center", marginRight: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, flex: 1 },
  modalClose: { padding: 4 },
  modalBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  modalButton: { backgroundColor: "#f3f4f6", borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  modalButtonText: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
});

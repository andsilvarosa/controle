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
  Shield,
  Info,
  X,
  BarChart3,
} from "lucide-react-native";

const COLORS = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  primaryLight: "#14b8a6",
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
  zinc50: "#fafafa",
  zinc100: "#f4f4f5",
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

  const renderInput = (Icon: any, value: string, onChange: (t: string) => void, placeholder: string, isPassword = false, keyboardType: "default" | "email-address" | "phone-pad" | "numeric" = "default", maxLength?: number) => (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIconContainer}>
        <Icon size={20} color={COLORS.textMuted} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize="none"
        maxLength={maxLength}
      />
      {isPassword && (
        <TouchableOpacity style={styles.inputEye} onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={20} color={COLORS.textMuted} /> : <Eye size={20} color={COLORS.textMuted} />}
        </TouchableOpacity>
      )}
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
          <TouchableOpacity style={styles.primaryButton} onPress={handleTwoFactor} disabled={isLoading || twoFactorCode.length !== 6}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verificar Código</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => { resetForm(); setMode("login"); }}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mode === "recovery") {
      return (
        <View style={styles.formSection}>
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

          {recoveryStep === 1 ? (
            <>
              {renderInput(Mail, email, setEmail, "E-mail cadastrado", false, "email-address")}
              <TouchableOpacity style={styles.primaryButton} onPress={handleRequestRecovery} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enviar Código</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {renderInput(Lock, recoveryCode, setRecoveryCode, "Código", false, "numeric", 6)}
              {renderInput(Lock, newPassword, setNewPassword, "Nova Senha", true)}
              {renderInput(Lock, confirmNewPassword, setConfirmNewPassword, "Confirmar Nova Senha", true)}
              <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Redefinir Senha</Text>}
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => { resetForm(); setMode("login"); setRecoveryStep(1); }}>
            <Text style={styles.backButtonText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.formSection}>
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

        {mode === "signup" && renderInput(User, name, setName, "Nome completo")}
        {renderInput(Mail, email, setEmail, "E-mail", false, "email-address")}
        {mode === "signup" && renderInput(Smartphone, phone, handlePhoneChange, "WhatsApp / Celular", false, "phone-pad", 15)}
        {renderInput(Lock, password, setPassword, "Senha", true)}
        {mode === "signup" && renderInput(Lock, confirmPassword, setConfirmPassword, "Confirmar Senha", true)}

        {mode === "login" && (
          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Check size={14} color="#fff" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>Lembrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { resetForm(); setMode("recovery"); }}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{mode === "signup" ? "Criar Conta" : "Entrar"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleButton} onPress={() => { resetForm(); setMode(mode === "login" ? "signup" : "login"); }}>
          <Text style={styles.toggleButtonText}>
            {mode === "login" ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getModalTitle = () => {
    if (activeModal === "privacy") return "Privacidade e Dados";
    if (activeModal === "security") return "Segurança e Proteção";
    if (activeModal === "help") return "Central de Ajuda";
    return "";
  };

  const getModalContent = () => {
    if (activeModal === "privacy") {
      return "Nosso compromisso com seus dados é total. No SOS Controle, acreditamos que sua privacidade não tem preço.\n\nNão vendemos, não alugamos e não compartilhamos suas informações pessoais ou financeiras com terceiros para fins publicitários.\n\nOperamos em total conformidade com a LGPD (Lei Geral de Proteção de Dados), garantindo que você tenha controle total sobre seus dados e a transparência necessária sobre como eles são utilizados para melhorar sua experiência.";
    }
    if (activeModal === "security") {
      return "Sua segurança é o pilar central da nossa plataforma. Utilizamos uma infraestrutura de nível bancário para proteger seu patrimônio digital.\n\nNossa estrutura conta com travas robustas contra ataques de força bruta e sistemas de detecção de intrusão em tempo real.\n\nImplementamos validação rigorosa em todas as camadas, autenticação de dois fatores (2FA) e criptografia de ponta a ponta, garantindo que apenas você tenha acesso às suas informações sensíveis.";
    }
    if (activeModal === "help") {
      return "Precisa de uma mãozinha? Estamos aqui para você!\n\nNossa central de ajuda conta com tutoriais detalhados e uma equipe de suporte humanizado pronta para tirar qualquer dúvida sobre a plataforma.\n\nVocê pode entrar em contato conosco pelo e-mail suporte@sostec.top ou através do chat disponível dentro do seu painel de controle após o login.";
    }
    return "";
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* BRAND HEADER - Estilo similar ao web */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>SOS</Text>
              </View>
              <Text style={styles.brandName}>Controle</Text>
            </View>
            
            <Text style={styles.headline}>Sua vida financeira{'\n'}em um só lugar.</Text>
            <Text style={styles.subheadline}>Gerencie seus gastos, planeje seu futuro e alcance seus objetivos com inteligência.</Text>
          </View>

          {/* AUTH CARD - Estilo similar ao web (lado direito branco) */}
          <View style={styles.authCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{getTitle()}</Text>
              <Text style={styles.cardSubtitle}>{getSubtitle()}</Text>
            </View>

            {renderForm()}
          </View>

          {/* BENTO GRID FEATURES - Similar ao web */}
          <View style={styles.featuresSection}>
            
            {/* Projeções com IA - Card Grande */}
            <View style={styles.featureCardLarge}>
              <View style={styles.featureIconBox}>
                <Sparkles size={28} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Projeções com Inteligência Artificial</Text>
                <Text style={styles.featureDesc}>Nosso algoritmo analisa seus hábitos e projeta seu saldo para os próximos meses, ajudando você a tomar decisões melhores hoje.</Text>
              </View>
            </View>

            {/* Segurança Máxima - Card Verde */}
            <View style={styles.featureCardPrimary}>
              <View style={styles.featureIconBoxPrimary}>
                <ShieldCheck size={28} color="#fff" />
              </View>
              <View style={styles.featureContentPrimary}>
                <Text style={styles.featureTitlePrimary}>Segurança Máxima</Text>
                <Text style={styles.featureDescPrimary}>Seus dados são protegidos com criptografia de ponta e protocolos bancários.</Text>
              </View>
            </View>

            {/* Automação - Card Pequeno */}
            <View style={styles.featureCardSmall}>
              <View style={styles.featureIconBoxSmall}>
                <Zap size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitleSmall}>Automação</Text>
              <Text style={styles.featureDescSmall}>Categorização automática de lançamentos e regras inteligentes para economizar tempo.</Text>
            </View>

            {/* Relatórios Detalhados - Card Grande */}
            <View style={styles.featureCardLarge}>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Relatórios Detalhados</Text>
                <Text style={styles.featureDesc}>Visualize sua evolução financeira com gráficos interativos e insights poderosos sobre seu comportamento de consumo.</Text>
              </View>
              <View style={styles.chartPlaceholder}>
                <View style={styles.chartBar} />
                <View style={[styles.chartBar, styles.chartBar2]} />
                <View style={[styles.chartBar, styles.chartBar3]} />
                <View style={[styles.chartBar, styles.chartBar4]} />
                <View style={[styles.chartBar, styles.chartBar5]} />
                <View style={[styles.chartBar, styles.chartBar6]} />
                <View style={[styles.chartBar, styles.chartBar7]} />
              </View>
            </View>

          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerLogo}>
              <Text style={styles.footerLogoText}>SOS</Text>
              <Text style={styles.footerCopyright}>Controle © 2024</Text>
            </View>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => setActiveModal("privacy")}>
                <Text style={styles.footerLink}>Privacidade</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveModal("security")}>
                <Text style={styles.footerLink}>Segurança</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveModal("help")}>
                <Text style={styles.footerLink}>Ajuda</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL */}
      <Modal visible={activeModal !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconBox}>
                  {activeModal === "privacy" && <Shield size={24} color={COLORS.primary} />}
                  {activeModal === "security" && <ShieldCheck size={24} color={COLORS.primary} />}
                  {activeModal === "help" && <Info size={24} color={COLORS.primary} />}
                </View>
                <Text style={styles.modalTitle}>{getModalTitle()}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.modalClose}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>{getModalContent()}</Text>
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
  
  // Brand Section
  brandSection: { alignItems: "center", paddingTop: 20, paddingBottom: 24 },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  logoBadge: { width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  logoText: { fontSize: 20, fontWeight: "900", color: "#fff" },
  brandName: { fontSize: 24, fontWeight: "900", color: COLORS.text },
  headline: { fontSize: 28, fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: 10, lineHeight: 36 },
  subheadline: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", maxWidth: 280, lineHeight: 20 },
  
  // Auth Card
  authCard: { backgroundColor: COLORS.card, borderRadius: 32, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8, marginBottom: 24 },
  cardHeader: { marginBottom: 20 },
  cardTitle: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: COLORS.textSecondary },
  formSection: {},
  alertBanner: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.errorBg, padding: 14, borderRadius: 16, marginBottom: 16 },
  alertSuccess: { backgroundColor: COLORS.successBg },
  alertText: { flex: 1, marginLeft: 10, fontSize: 13, fontWeight: "600", color: COLORS.error },
  alertTextSuccess: { color: COLORS.success },
  
  // Inputs
  inputWrapper: { position: "relative", marginBottom: 14 },
  inputIconContainer: { position: "absolute", left: 16, top: 0, bottom: 0, justifyContent: "center", zIndex: 1 },
  input: { backgroundColor: COLORS.zinc100, borderRadius: 24, paddingVertical: 16, paddingLeft: 48, paddingRight: 48, fontSize: 16, fontWeight: "500", color: COLORS.text },
  inputEye: { position: "absolute", right: 16, top: 0, bottom: 0, justifyContent: "center", zIndex: 1 },
  
  // 2FA
  twoFactorIcon: { alignItems: "center", marginBottom: 16 },
  twoFactorInput: { backgroundColor: COLORS.zinc100, borderRadius: 24, paddingVertical: 20, fontSize: 32, fontWeight: "700", color: COLORS.text, textAlign: "center", letterSpacing: 16, marginBottom: 20 },
  
  // Checkbox & Forgot
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingHorizontal: 4 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, marginRight: 10, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: 13, color: COLORS.textSecondary },
  forgotText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  
  // Buttons
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 18, alignItems: "center", marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 1.5 },
  toggleButton: { paddingVertical: 16, alignItems: "center" },
  toggleButtonText: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1.5 },
  backButton: { paddingVertical: 14, alignItems: "center" },
  backButtonText: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1.5 },
  
  // Features Section
  featuresSection: { gap: 12 },
  featureCardLarge: { backgroundColor: COLORS.card, borderRadius: 32, padding: 20, flexDirection: "row", alignItems: "center", gap: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureIconBox: { width: 64, height: 64, borderRadius: 24, backgroundColor: "#f0fdfa", alignItems: "center", justifyContent: "center", marginRight: 4 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  featureDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  
  // Primary Feature Card (Verde)
  featureCardPrimary: { backgroundColor: COLORS.primary, borderRadius: 32, padding: 20, flexDirection: "row", alignItems: "center", gap: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  featureIconBoxPrimary: { width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  featureContentPrimary: { flex: 1 },
  featureTitlePrimary: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 4 },
  featureDescPrimary: { fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 18 },
  
  // Small Feature Card
  featureCardSmall: { backgroundColor: COLORS.card, borderRadius: 32, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureIconBoxSmall: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#f0fdfa", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featureTitleSmall: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  featureDescSmall: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
  
  // Chart placeholder
  chartPlaceholder: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 60 },
  chartBar: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 4, height: "40%" },
  chartBar2: { height: "60%" },
  chartBar3: { height: "35%" },
  chartBar4: { height: "80%" },
  chartBar5: { height: "55%" },
  chartBar6: { height: "70%" },
  chartBar7: { height: "45%" },
  
  // Footer
  footer: { marginTop: 32, alignItems: "center", gap: 16 },
  footerLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerLogoText: { fontSize: 14, fontWeight: "900", color: COLORS.textMuted },
  footerCopyright: { fontSize: 10, fontWeight: "600", color: COLORS.textMuted, letterSpacing: 2 },
  footerLinks: { flexDirection: "row", gap: 24 },
  footerLink: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary, letterSpacing: 1 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: COLORS.card, borderRadius: 28, padding: 24, maxWidth: 420 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  modalTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  modalIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#f0fdfa", alignItems: "center", justifyContent: "center", marginRight: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, flex: 1 },
  modalClose: { padding: 4 },
  modalBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  modalButton: { backgroundColor: COLORS.zinc100, borderRadius: 18, paddingVertical: 14, alignItems: "center" },
  modalButtonText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
});

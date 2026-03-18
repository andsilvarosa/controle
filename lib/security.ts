
/**
 * Utilitários de segurança centralizados para a aplicação.
 */

export const getSecurityHeaders = (origin: string | null = null) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://picsum.photos; connect-src 'self' https://*.run.app",
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
};

/**
 * Sanitiza strings para remover tags HTML básicas e evitar XSS.
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<[^>]*>?/gm, "")
    .trim();
};

/**
 * Registra uma ação no log de auditoria.
 */
export const logAction = async (sql: any, userId: string | null, action: string, details: string, request: Request) => {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    try {
        await sql("INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES ($1, $2, $3, $4, $5)", [crypto.randomUUID(), userId, action, details, ip]);
    } catch (e) {
        console.error("Erro ao registrar log de auditoria:", e);
    }
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { valid: false, message: "A senha deve ter pelo menos 8 caracteres." };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  
  if (password.length < 10 && (!hasUpperCase || !hasLowerCase || !hasNumbers)) {
      return { valid: false, message: "Senha fraca. Use pelo menos 8 caracteres misturando letras e números." };
  }

  return { valid: true };
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

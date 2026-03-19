import jwt from '@tsndr/cloudflare-worker-jwt';

/**
 * Utilitários de segurança centralizados para a aplicação.
 */

export const getSecurityHeaders = (origin: string | null = null) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://picsum.photos; connect-src 'self' https://*.run.app https://*.sostec.top; frame-ancestors 'none'; object-src 'none'; base-uri 'self';",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-Permitted-Cross-Domain-Policies': 'none',
  };

  if (origin) {
    // Em produção, você deve validar o origin contra uma whitelist
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
};

/**
 * Verifica o limite de taxa (Rate Limit) para uma chave específica.
 */
export const checkRateLimit = async (sql: any, key: string, limit: number, windowSeconds: number): Promise<{ success: boolean; remaining: number }> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
    
    // Limpar registros expirados (opcional, pode ser feito em cron)
    // await sql("DELETE FROM rate_limits WHERE expires_at < CURRENT_TIMESTAMP");

    const rows = await sql("SELECT attempts, expires_at FROM rate_limits WHERE key = $1", [key]);
    
    if (rows.length === 0) {
        await sql("INSERT INTO rate_limits (key, attempts, expires_at) VALUES ($1, 1, $2)", [key, expiresAt]);
        return { success: true, remaining: limit - 1 };
    }

    const record = rows[0];
    const recordExpiresAt = new Date(record.expires_at);

    if (now > recordExpiresAt) {
        // Janela expirou, resetar
        await sql("UPDATE rate_limits SET attempts = 1, expires_at = $1, last_attempt = CURRENT_TIMESTAMP WHERE key = $2", [expiresAt, key]);
        return { success: true, remaining: limit - 1 };
    }

    if (record.attempts >= limit) {
        return { success: false, remaining: 0 };
    }

    await sql("UPDATE rate_limits SET attempts = attempts + 1, last_attempt = CURRENT_TIMESTAMP WHERE key = $1", [key]);
    return { success: true, remaining: limit - (record.attempts + 1) };
};

interface SessionValidationResult {
    isValid: boolean;
    userId?: string;
    sessionId?: string;
    error?: string;
    status?: number;
}

/**
 * Valida o token JWT e a sessão ativa no banco de dados.
 */
export const validateSession = async (request: Request, secret: string, sql: any, waitUntil?: any): Promise<SessionValidationResult> => {
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
        const cookies = (cookieHeader || '').split(';').reduce((acc, cookie) => {
            const parts = cookie.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, string>);
        token = cookies['sos_token'];
    }

    if (!token) {
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
    }

    if (!token) return { isValid: false, error: "Token não fornecido", status: 401 };

    try {
        const isValid = await jwt.verify(token, secret);
        if (!isValid) return { isValid: false, error: "Token inválido ou expirado", status: 401 };

        const { payload } = jwt.decode(token);
        const userId = (payload as any).id;
        const sessionId = (payload as any).sid;

        if (sessionId) {
            const sessionCheck = await sql("SELECT id FROM sessions WHERE id = $1 AND user_id = $2", [sessionId, userId]);
            if (sessionCheck.length === 0) return { isValid: false, error: "Sessão revogada", status: 401 };
            
            // Atualizar last_active de forma assíncrona
            if (waitUntil) {
                waitUntil(sql("UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE id = $1", [sessionId]));
            }
            
            return { isValid: true, userId, sessionId };
        }

        return { isValid: true, userId };
    } catch (e) {
        return { isValid: false, error: "Erro ao validar token", status: 401 };
    }
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

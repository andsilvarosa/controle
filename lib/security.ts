
/**
 * Utilitários de segurança centralizados para a aplicação.
 */

export const getSecurityHeaders = (origin: string | null = null) => {
  // Em um ambiente de produção real, você deve substituir '*' pelo seu domínio específico.
  // Ex: const allowedOrigin = 'https://sos-controle.pages.dev';
  
  const headers: any = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  // Se houver uma origem, usamos ela. Caso contrário, usamos '*' apenas se não houver credenciais.
  // Mas como usamos credenciais, precisamos de uma origem específica ou refletir a origem da requisição.
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
    // Nota: Se for '*', Access-Control-Allow-Credentials será ignorado pelos navegadores modernos.
  }

  return headers;
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

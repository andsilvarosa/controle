import { getDb } from "../../lib/db";
import { getSecurityHeaders, validatePassword, validateEmail, sanitizeInput, logAction, checkRateLimit } from "../../lib/security";
import { Resend } from 'resend';
import * as OTPAuth from 'otpauth';
import jwt from '@tsndr/cloudflare-worker-jwt';

type PagesFunction<T = any> = (context: {
    request: Request;
    env: T;
    params: any;
    waitUntil: any;
    next: any;
    data: any;
}) => Response | Promise<Response>;

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get("Origin");
  const headers = getSecurityHeaders(origin);
  return new Response(null, { status: 204, headers });
};

export const onRequestPost: PagesFunction<{ DATABASE_URL: string, RESEND_API_KEY: string, JWT_SECRET: string }> = async (context) => {
  const origin = context.request.headers.get("Origin");
  const headers = getSecurityHeaders(origin);
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";

  // 🛡️ PROTEÇÃO CSRF BÁSICA: Verificar Origin
  const allowedOrigins = [
    "https://ais-dev-mmrmygbrpgamqqlhn5uhnm-61596290429.us-east1.run.app",
    "https://ais-pre-mmrmygbrpgamqqlhn5uhnm-61596290429.us-east1.run.app"
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
      return new Response(JSON.stringify({ error: "Requisição não autorizada (CORS/CSRF)." }), { status: 403, headers });
  }

  try {
    const sql = getDb(context.env.DATABASE_URL);
    const body: any = await context.request.json();
    const { action, email, password, userData, currentPassword, newPassword, userId, token, twoFactorToken, secret } = body;

    // 🛡️ RATE LIMITING GLOBAL POR IP
    const rateLimit = await checkRateLimit(sql, `rl_ip_${ip}`, 100, 3600); // 100 reqs/hora por IP
    if (!rateLimit.success) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente mais tarde." }), { status: 429, headers });
    }

    // 🔑 Senha secreta para assinar o crachá (JWT)
    const JWT_SECRET = context.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return new Response(JSON.stringify({ error: "Erro de configuração: JWT_SECRET não definida." }), { status: 500, headers });
    }

    // ... (resto das funções auxiliares)
    async function hashPassword(password: string): Promise<string> {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        256
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
      return `${saltHex}:${hashHex}`;
    }

    async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
      if (storedHash.includes(':')) {
        const [saltHex, hashHex] = storedHash.split(':');
        const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          { name: "PBKDF2" },
          false,
          ["deriveBits"]
        );
        const hashBuffer = await crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
          },
          keyMaterial,
          256
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const computedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return computedHashHex === hashHex;
      } else {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const computedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return computedHashHex === storedHash;
      }
    }

    const getAuthUser = async (req: Request) => {
        const cookieHeader = req.headers.get("Cookie");
        let token = null;
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.split('=').map(c => c.trim());
                acc[key] = value;
                return acc;
            }, {} as Record<string, string>);
            token = cookies['sos_token'];
        }

        if (!token) {
            const authHeader = req.headers.get("Authorization");
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) return null;

        try {
            const isValid = await jwt.verify(token, JWT_SECRET);
            if (!isValid) return null;
            const { payload } = jwt.decode(token);
            const userId = (payload as any).id;
            const sessionId = (payload as any).sid;

            if (sessionId) {
                const sessionCheck = await sql("SELECT id FROM sessions WHERE id = $1 AND user_id = $2", [sessionId, userId]);
                if (sessionCheck.length === 0) return null;
                // Atualizar last_active de forma assíncrona (não bloqueante)
                context.waitUntil(sql("UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE id = $1", [sessionId]));
            }

            return userId;
        } catch (e) {
            return null;
        }
    };

    const handleNewLogin = async (user: any, req: Request) => {
        const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";
        const ua = req.headers.get("User-Agent") || "Unknown";
        const sessionId = crypto.randomUUID();

        // Registrar sessão
        await sql("INSERT INTO sessions (id, user_id, user_agent, ip_address) VALUES ($1, $2, $3, $4)", [sessionId, user.id, ua, ip]);

        // Verificar dispositivo conhecido
        const known = await sql("SELECT id FROM known_devices WHERE user_id = $1 AND user_agent = $2 AND ip_address = $3", [user.id, ua, ip]);
        
        if (known.length === 0) {
            // Novo dispositivo!
            await sql("INSERT INTO known_devices (id, user_id, user_agent, ip_address) VALUES ($1, $2, $3, $4)", [crypto.randomUUID(), user.id, ua, ip]);
            
            // Enviar e-mail de alerta
            if (context.env.RESEND_API_KEY) {
                const resend = new Resend(context.env.RESEND_API_KEY);
                try {
                    await resend.emails.send({
                        from: 'SOS Controle <no-reply@sostec.top>',
                        to: user.email,
                        subject: '⚠️ Alerta de Segurança: Novo Acesso Detectado',
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #d32f2f;">Novo Acesso Detectado</h2>
                                <p>Olá, <strong>${user.name}</strong>.</p>
                                <p>Sua conta foi acessada a partir de um novo dispositivo ou local.</p>
                                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                                    <p style="margin: 5px 0;"><strong>IP:</strong> ${ip}</p>
                                    <p style="margin: 5px 0;"><strong>Dispositivo:</strong> ${ua}</p>
                                </div>
                                <p>Se foi você, pode ignorar este e-mail. Caso contrário, recomendamos que você altere sua senha imediatamente e encerre as sessões ativas no painel de segurança.</p>
                                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="font-size: 12px; color: #888;">Este é um e-mail automático de segurança do SOS Controle.</p>
                            </div>
                        `
                    });
                } catch (e) {
                    console.error("Erro ao enviar e-mail de alerta de login:", e);
                }
            }
        }

        return sessionId;
    };

    // --- CHECK SESSION ---
    if (action === "check_session") {
        const authUserId = await getAuthUser(context.request);
        if (!authUserId) {
            return new Response(JSON.stringify({ error: "Sessão expirada." }), { status: 401, headers });
        }

        const rows = await sql("SELECT id, name, email, phone, avatar, two_factor_enabled, created_at FROM users WHERE id = $1", [authUserId]);
        if (rows.length === 0) {
            return new Response(JSON.stringify({ error: "Usuário não encontrado." }), { status: 404, headers });
        }

        const user = rows[0];
        return new Response(JSON.stringify(user), { headers });
    }

    // --- LOGIN FLOW ---
    if (action === "login") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "E-mail e senha são obrigatórios." }), { status: 400, headers });
      }

      // 🛡️ RATE LIMITING POR E-MAIL (Prevenir brute force em conta específica)
      const loginLimit = await checkRateLimit(sql, `login_attempt_${email}`, 5, 300); // 5 tentativas a cada 5 min
      if (!loginLimit.success) {
          return new Response(JSON.stringify({ error: "Muitas tentativas de login. Tente novamente em 5 minutos." }), { status: 429, headers });
      }
      
      const cleanEmail = sanitizeInput(email);
      if (!validateEmail(cleanEmail)) {
        return new Response(JSON.stringify({ error: "E-mail inválido." }), { status: 400, headers });
      }

      const rows = await sql("SELECT * FROM users WHERE email = $1", [cleanEmail]);
      
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "E-mail ou senha incorretos." }), { status: 401, headers });
      }

      const user = rows[0];

      // Verificação de bloqueio (Rate Limiting)
      if (user.lock_until && new Date(user.lock_until) > new Date()) {
          const waitTime = Math.ceil((new Date(user.lock_until).getTime() - Date.now()) / 60000);
          return new Response(JSON.stringify({ error: `Conta bloqueada temporariamente. Tente novamente em ${waitTime} minutos.` }), { status: 403, headers });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        const attempts = (user.failed_attempts || 0) + 1;
        if (attempts >= 5) {
            const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de bloqueio
            await sql("UPDATE users SET failed_attempts = $1, lock_until = $2 WHERE id = $3", [attempts, lockUntil.toISOString(), user.id]);
            await logAction(sql, user.id, "ACCOUNT_LOCKED", "Múltiplas tentativas de login falhas.", context.request);
            return new Response(JSON.stringify({ error: "Muitas tentativas falhas. Conta bloqueada por 15 minutos." }), { status: 403, headers });
        } else {
            await sql("UPDATE users SET failed_attempts = $1 WHERE id = $2", [attempts, user.id]);
            return new Response(JSON.stringify({ error: "E-mail ou senha incorretos." }), { status: 401, headers });
        }
      }

      // Resetar tentativas falhas após login bem-sucedido
      await sql("UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = $1", [user.id]);
      
      // Upgrade password hash se estiver no formato antigo
      if (!user.password.includes(':')) {
         const newHash = await hashPassword(password);
         await sql("UPDATE users SET password = $1 WHERE id = $2", [newHash, user.id]);
      }

      if (user.two_factor_enabled) {
        if (twoFactorToken) {
           // 🛡️ RATE LIMITING POR 2FA (Prevenir brute force no código TOTP)
           const twoFactorLimit = await checkRateLimit(sql, `2fa_attempt_${user.id}`, 5, 300); // 5 tentativas a cada 5 min
           if (!twoFactorLimit.success) {
               return new Response(JSON.stringify({ error: "Muitas tentativas de 2FA. Tente novamente em 5 minutos." }), { status: 429, headers });
           }

           if (!user.two_factor_secret) {
              return new Response(JSON.stringify({ error: "Erro de segurança: 2FA configurado incorretamente." }), { status: 500, headers });
           }

           const totp = new OTPAuth.TOTP({
              algorithm: 'SHA1',
              digits: 6,
              period: 30,
              secret: OTPAuth.Secret.fromBase32(user.two_factor_secret)
           });

           const delta = totp.validate({ token: twoFactorToken, window: 1 });

           if (delta === null) {
              await logAction(sql, user.id, "LOGIN_2FA_FAILED", "Código 2FA incorreto.", context.request);
              return new Response(JSON.stringify({ error: "Código 2FA incorreto ou expirado." }), { status: 401, headers });
           }
           
           // 🎫 SUCESSO 2FA: Gera o Token (Crachá)
           const sessionId = await handleNewLogin(user, context.request);
           const tokenJWT = await jwt.sign({ id: user.id, email: user.email, sid: sessionId, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, JWT_SECRET);
           const cookieHeader = `sos_token=${tokenJWT}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`;
           const { password: _, two_factor_secret: __, ...userSafe } = user;
           await logAction(sql, user.id, "LOGIN_SUCCESS", "Login realizado com sucesso via 2FA.", context.request);
           return new Response(JSON.stringify({ ...userSafe, token: tokenJWT }), { headers: { ...headers, 'Set-Cookie': cookieHeader } });
        } else {
           return new Response(JSON.stringify({ require2fa: true, tempId: user.id }), { headers });
        }
      }

      // 🎫 SUCESSO LOGIN NORMAL: Gera o Token (Crachá)
      const sessionId = await handleNewLogin(user, context.request);
      const tokenJWT = await jwt.sign({ id: user.id, email: user.email, sid: sessionId, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, JWT_SECRET);
      const cookieHeader = `sos_token=${tokenJWT}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`;
      const { password: _, two_factor_secret: __, ...userSafe } = user;
      await logAction(sql, user.id, "LOGIN_SUCCESS", "Login realizado com sucesso.", context.request);
      return new Response(JSON.stringify({ ...userSafe, token: tokenJWT }), { headers: { ...headers, 'Set-Cookie': cookieHeader } });
    }

    // --- SIGNUP ---
    if (action === "signup") {
      if (!email || !password || !userData?.name) {
        return new Response(JSON.stringify({ error: "Todos os campos são obrigatórios." }), { status: 400, headers });
      }

      // 🛡️ RATE LIMITING POR IP PARA SIGNUP (Prevenir criação massiva de contas)
      const signupLimit = await checkRateLimit(sql, `signup_ip_${ip}`, 3, 3600); // 3 contas por hora por IP
      if (!signupLimit.success) {
          return new Response(JSON.stringify({ error: "Limite de criação de contas excedido. Tente novamente mais tarde." }), { status: 429, headers });
      }
      
      const cleanEmail = sanitizeInput(email);
      const cleanName = sanitizeInput(userData.name);

      if (!validateEmail(cleanEmail)) {
        return new Response(JSON.stringify({ error: "E-mail inválido." }), { status: 400, headers });
      }
      
      const pwdCheck = validatePassword(password);
      if (!pwdCheck.valid) {
        return new Response(JSON.stringify({ error: pwdCheck.message }), { status: 400, headers });
      }

      const check = await sql("SELECT id FROM users WHERE email = $1", [cleanEmail]);
      if (check.length > 0) {
        return new Response(JSON.stringify({ error: "Este e-mail já está cadastrado." }), { status: 409, headers });
      }

      const id = crypto.randomUUID(); 
      const rawPassword = userData?.password || password;
      const hashedPassword = await hashPassword(rawPassword);
      
      await sql(
        "INSERT INTO users (id, name, email, phone, password, avatar) VALUES ($1, $2, $3, $4, $5, $6)", 
        [id, cleanName || "Novo Usuário", cleanEmail, userData?.phone || null, hashedPassword, userData?.avatar || "icon:User:teal"]
      );
      
      const defaultCats = [
        { id: crypto.randomUUID(), name: 'Alimentação', icon: 'Utensils', color: '#ef4444', type: 'expense' },
        { id: crypto.randomUUID(), name: 'Salário', icon: 'Briefcase', color: '#14b8a6', type: 'income' },
        { id: crypto.randomUUID(), name: 'Lazer', icon: 'Film', color: '#8b5cf6', type: 'expense' },
        { id: crypto.randomUUID(), name: 'Transporte', icon: 'Car', color: '#f59e0b', type: 'expense' }
      ];

      for (const cat of defaultCats) {
        await sql("INSERT INTO categories (id, user_id, name, icon, color, type) VALUES ($1, $2, $3, $4, $5, $6)", [cat.id, id, cat.name, cat.icon, cat.color, cat.type]);
      }
      await sql("INSERT INTO wallets (id, user_id, name, type, color, balance) VALUES ($1, $2, $3, $4, $5, $6)", [crypto.randomUUID(), id, 'Conta Principal', 'checking', '#14b8a6', 0]);

      await logAction(sql, id, "SIGNUP_SUCCESS", "Novo usuário cadastrado.", context.request);

      // 🎫 SUCESSO CADASTRO: Gera o Token (Crachá)
      const userForSession = { id, name: cleanName || "Novo Usuário", email: cleanEmail };
      const sessionId = await handleNewLogin(userForSession, context.request);
      const tokenJWT = await jwt.sign({ id: id, email: cleanEmail, sid: sessionId, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, JWT_SECRET);
      const cookieHeader = `sos_token=${tokenJWT}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`;
      return new Response(JSON.stringify({ id, name: cleanName || "Novo Usuário", email: cleanEmail, token: tokenJWT }), { status: 201, headers: { ...headers, 'Set-Cookie': cookieHeader } });
    }

    // --- LOGOUT ---
    if (action === "logout") {
      const authUserId = await getAuthUser(context.request);
      if (authUserId) await logAction(sql, authUserId, "LOGOUT", "Usuário deslogado.", context.request);
      const cookieHeader = `sos_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
      return new Response(JSON.stringify({ success: true }), { headers: { ...headers, 'Set-Cookie': cookieHeader } });
    }

    // --- 2FA SETUP: GENERATE ---
    if (action === "2fa_generate") {
       const authUserId = await getAuthUser(context.request);
       if (!authUserId) return new Response(JSON.stringify({ error: "Não autorizado." }), { status: 401, headers });

       const userCheck = await sql("SELECT email FROM users WHERE id = $1", [authUserId]);
       if (userCheck.length === 0) return new Response(JSON.stringify({ error: "Usuário não encontrado." }), { status: 404, headers });
       
       const emailUser = userCheck[0].email;
       const generatedSecret = new OTPAuth.Secret({ size: 20 });
       
       const totp = new OTPAuth.TOTP({ issuer: 'SOS Controle', label: emailUser, algorithm: 'SHA1', digits: 6, period: 30, secret: generatedSecret });

       const otpauthUrl = totp.toString();
       return new Response(JSON.stringify({ secret: generatedSecret.base32, otpauthUrl }), { headers });
    }

    // --- 2FA SETUP: ENABLE/VERIFY ---
    if (action === "2fa_enable") {
       const authUserId = await getAuthUser(context.request);
       if (!authUserId) return new Response(JSON.stringify({ error: "Não autorizado." }), { status: 401, headers });

       if (!secret || !twoFactorToken) return new Response(JSON.stringify({ error: "Dados incompletos." }), { status: 400, headers });

       const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) });
       const delta = totp.validate({ token: twoFactorToken, window: 1 });
       
       if (delta === null) return new Response(JSON.stringify({ error: "Código inválido. Verifique o app autenticador." }), { status: 400, headers });

       await sql("UPDATE users SET two_factor_enabled = TRUE, two_factor_secret = $1 WHERE id = $2", [secret, authUserId]);
       await logAction(sql, authUserId, "2FA_ENABLED", "Autenticação de dois fatores ativada.", context.request);
       return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- 2FA DISABLE ---
    if (action === "2fa_disable") {
       const authUserId = await getAuthUser(context.request);
       if (!authUserId) return new Response(JSON.stringify({ error: "Não autorizado." }), { status: 401, headers });

       const userCheck = await sql("SELECT id, password FROM users WHERE id = $1", [authUserId]);
       if (userCheck.length === 0) return new Response(JSON.stringify({ error: "Usuário não encontrado." }), { status: 404, headers });
       
       const isValid = await verifyPassword(currentPassword, userCheck[0].password);
       if (!isValid) return new Response(JSON.stringify({ error: "Senha incorreta." }), { status: 401, headers });

       await sql("UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1", [authUserId]);
       await logAction(sql, authUserId, "2FA_DISABLED", "Autenticação de dois fatores desativada.", context.request);
       return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- FORGOT PASSWORD ---
    if (action === "forgot_password") {
        if (!context.env.RESEND_API_KEY) return new Response(JSON.stringify({ error: "Erro de configuração: RESEND_API_KEY não encontrada." }), { status: 500, headers });

        const cleanEmail = sanitizeInput(email);
        const users = await sql("SELECT id, name FROM users WHERE email = $1", [cleanEmail]);
        if (users.length === 0) return new Response(JSON.stringify({ error: "E-mail não encontrado em nossa base." }), { status: 404, headers });

        const user = users[0];
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

        const requestUrl = new URL(context.request.url);
        const origin = requestUrl.origin;
        const resetLink = `${origin}/?token=${resetToken}`;

        await sql("DELETE FROM password_resets WHERE user_id = $1", [user.id]);
        await sql("INSERT INTO password_resets (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)", [crypto.randomUUID(), user.id, resetToken, expiresAt.toISOString()]);

        try {
            const resend = new Resend(context.env.RESEND_API_KEY);
            const { error: resendError } = await resend.emails.send({
                from: 'SOS Controle <no-reply@sostec.top>',
                to: [cleanEmail],
                subject: '🔑 Recupeção de Senha: SOS Controle',
                html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; padding: 20px; color: #333;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #007bff;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SOS Controle</h1>
            </td>
        </tr>
        
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="font-size: 20px; color: #333; margin-top: 0;">Recuperação de Senha</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #666;">
                    Olá, <strong>${user.name}</strong>, recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo ou clique no botão para prosseguir:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; padding: 15px 30px; background-color: #f8f9fa; border: 2px dashed #007bff; color: #007bff; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 4px;">
                        ${resetToken}
                    </span>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #007bff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                        Redefinir Minha Senha
                    </a>
                </div>
                <p style="font-size: 14px; color: #999; text-align: center;">
                    Este link/código é válido por <strong>1 hora</strong>.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 12px; line-height: 1.6; color: #999; margin-bottom: 0;">
                    Se você não solicitou essa alteração, por favor ignore este e-mail. Nenhuma alteração foi feita na sua conta ainda.
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 20px; text-align: center; background-color: #f8f9fa; font-size: 12px; color: #aaa;">
                &copy; ${new Date().getFullYear()} Sostec. Todos os direitos reservados.
            </td>
        </tr>
    </table>
</div>`
            });

            if (resendError) throw resendError;
            await logAction(sql, user.id, "PASSWORD_RESET_REQUESTED", "E-mail de recuperação enviado.", context.request);
            return new Response(JSON.stringify({ success: true, message: "Código e link enviados com sucesso!" }), { headers });
        } catch (err: any) {
            return new Response(JSON.stringify({ error: "Falha técnica ao processar e-mail." }), { status: 500, headers });
        }
    }

    // --- RESET PASSWORD CONFIRM ---
    if (action === "reset_password_confirm") {
        const now = new Date().toISOString();
        const resetRecord = await sql("SELECT * FROM password_resets WHERE token = $1 AND expires_at > $2 LIMIT 1", [token, now]);
        if (resetRecord.length === 0) return new Response(JSON.stringify({ error: "Código inválido ou expirado." }), { status: 400, headers });

        const hashedNewPassword = await hashPassword(newPassword);
        await sql("UPDATE users SET password = $1 WHERE id = $2", [hashedNewPassword, resetRecord[0].user_id]);
        await sql("DELETE FROM password_resets WHERE id = $1", [resetRecord[0].id]);

        await logAction(sql, resetRecord[0].user_id, "PASSWORD_RESET_SUCCESS", "Senha redefinida com sucesso via token.", context.request);
        return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- UPDATE PROFILE / PASSWORD ---
    if (action === "update_profile") {
      const authUserId = await getAuthUser(context.request);
      if (!authUserId) return new Response(JSON.stringify({ error: "Não autorizado." }), { status: 401, headers });

      const cleanName = sanitizeInput(userData.name);
      const cleanPhone = sanitizeInput(userData.phone);

      await sql("UPDATE users SET name=$1, phone=$2, avatar=$3 WHERE id=$4", [cleanName, cleanPhone, userData.avatar, authUserId]);
      await logAction(sql, authUserId, "PROFILE_UPDATED", "Dados do perfil atualizados.", context.request);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === "update_password") {
      const authUserId = await getAuthUser(context.request);
      if (!authUserId) return new Response(JSON.stringify({ error: "Não autorizado." }), { status: 401, headers });

      if (!currentPassword || !newPassword) {
        return new Response(JSON.stringify({ error: "Senha atual e nova senha são obrigatórias." }), { status: 400, headers });
      }
      
      const pwdCheck = validatePassword(newPassword);
      if (!pwdCheck.valid) {
        return new Response(JSON.stringify({ error: pwdCheck.message }), { status: 400, headers });
      }

      const userCheck = await sql("SELECT id, password FROM users WHERE id = $1", [authUserId]);
      if (userCheck.length === 0) return new Response(JSON.stringify({ error: "Usuário não encontrado." }), { status: 404, headers });
      
      const isValid = await verifyPassword(currentPassword, userCheck[0].password);
      if (!isValid) return new Response(JSON.stringify({ error: "Senha atual incorreta." }), { status: 401, headers });
      
      const hashedNewPassword = await hashPassword(newPassword);
      await sql("UPDATE users SET password = $1 WHERE id = $2", [hashedNewPassword, authUserId]);
      await logAction(sql, authUserId, "PASSWORD_UPDATED", "Senha alterada pelo usuário.", context.request);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Erro interno do servidor" }), { status: 500, headers });
  }
};
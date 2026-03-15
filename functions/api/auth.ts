import { getDb } from "../../lib/db";
import { Resend } from 'resend';
import * as OTPAuth from 'otpauth';
import jwt from '@tsndr/cloudflare-worker-jwt'; // <-- A biblioteca que você instalou

type PagesFunction<T = any> = (context: {
    request: Request;
    env: T;
    params: any;
    waitUntil: any;
    next: any;
    data: any;
}) => Response | Promise<Response>;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers });
};

export const onRequestPost: PagesFunction<{ DATABASE_URL: string, RESEND_API_KEY: string, JWT_SECRET: string }> = async (context) => {
  try {
    const sql = getDb(context.env.DATABASE_URL);
    const body: any = await context.request.json();
    const { action, email, password, userData, currentPassword, newPassword, userId, token, twoFactorToken, secret } = body;

    // 🔑 Senha secreta para assinar o crachá (JWT)
    const JWT_SECRET = context.env.JWT_SECRET || 'minha_chave_super_secreta_123';

    // --- LOGIN FLOW ---
    if (action === "login") {
      const hashedPassword = await hashPassword(password);
      const rows = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${hashedPassword}`;
      
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "E-mail ou senha incorretos." }), { status: 401, headers });
      }

      const user = rows[0];

      if (user.two_factor_enabled) {
        if (twoFactorToken) {
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
              return new Response(JSON.stringify({ error: "Código 2FA incorreto ou expirado." }), { status: 401, headers });
           }
           
           // 🎫 SUCESSO 2FA: Gera o Token (Crachá)
           const tokenJWT = await jwt.sign({ id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, JWT_SECRET);
           return new Response(JSON.stringify({ ...user, token: tokenJWT }), { headers });
        } else {
           return new Response(JSON.stringify({ require2fa: true, tempId: user.id }), { headers });
        }
      }

      // 🎫 SUCESSO LOGIN NORMAL: Gera o Token (Crachá)
      const tokenJWT = await jwt.sign({ id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, JWT_SECRET);
      return new Response(JSON.stringify({ ...user, token: tokenJWT }), { headers });
    }

    // --- SIGNUP ---
    if (action === "signup") {
      const check = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (check.length > 0) {
        return new Response(JSON.stringify({ error: "Este e-mail já está cadastrado." }), { status: 409, headers });
      }

      const id = userData?.id || crypto.randomUUID();
      const rawPassword = userData?.password || password;
      const hashedPassword = await hashPassword(rawPassword);
      
      await sql`
        INSERT INTO users (id, name, email, phone, password, avatar) 
        VALUES (${id}, ${userData?.name || "Novo Usuário"}, ${email}, ${userData?.phone || null}, ${hashedPassword}, ${userData?.avatar || "icon:User:teal"})
      `;
      
      const defaultCats = [
        { id: crypto.randomUUID(), name: 'Alimentação', icon: 'Utensils', color: '#ef4444', type: 'expense' },
        { id: crypto.randomUUID(), name: 'Salário', icon: 'Briefcase', color: '#14b8a6', type: 'income' },
        { id: crypto.randomUUID(), name: 'Lazer', icon: 'Film', color: '#8b5cf6', type: 'expense' },
        { id: crypto.randomUUID(), name: 'Transporte', icon: 'Car', color: '#f59e0b', type: 'expense' }
      ];

      for (const cat of defaultCats) {
        await sql`INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (${cat.id}, ${id}, ${cat.name}, ${cat.icon}, ${cat.color}, ${cat.type})`;
      }
      await sql`INSERT INTO wallets (id, user_id, name, type, color, balance) VALUES (${crypto.randomUUID()}, ${id}, 'Conta Principal', 'checking', '#14b8a6', 0)`;

      // 🎫 SUCESSO CADASTRO: Gera o Token (Crachá)
      const tokenJWT = await jwt.sign({ id: id, email: email, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, JWT_SECRET);
      return new Response(JSON.stringify({ ...userData, id, token: tokenJWT }), { status: 201, headers });
    }

    // --- 2FA SETUP: GENERATE ---
    if (action === "2fa_generate") {
       const userCheck = await sql`SELECT email FROM users WHERE id = ${userId}`;
       if (userCheck.length === 0) return new Response(JSON.stringify({ error: "Usuário não encontrado." }), { status: 404, headers });
       
       const emailUser = userCheck[0].email;
       const generatedSecret = new OTPAuth.Secret({ size: 20 });
       
       const totp = new OTPAuth.TOTP({ issuer: 'SOS Controle', label: emailUser, algorithm: 'SHA1', digits: 6, period: 30, secret: generatedSecret });

       const otpauthUrl = totp.toString();
       return new Response(JSON.stringify({ secret: generatedSecret.base32, otpauthUrl }), { headers });
    }

    // --- 2FA SETUP: ENABLE/VERIFY ---
    if (action === "2fa_enable") {
       if (!secret || !twoFactorToken) return new Response(JSON.stringify({ error: "Dados incompletos." }), { status: 400, headers });

       const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) });
       const delta = totp.validate({ token: twoFactorToken, window: 1 });
       
       if (delta === null) return new Response(JSON.stringify({ error: "Código inválido. Verifique o app autenticador." }), { status: 400, headers });

       await sql`UPDATE users SET two_factor_enabled = TRUE, two_factor_secret = ${secret} WHERE id = ${userId}`;
       return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- 2FA DISABLE ---
    if (action === "2fa_disable") {
       const hashedCurrentPassword = await hashPassword(currentPassword);
       const userCheck = await sql`SELECT id FROM users WHERE id = ${userId} AND password = ${hashedCurrentPassword}`;
       if (userCheck.length === 0) return new Response(JSON.stringify({ error: "Senha incorreta." }), { status: 401, headers });

       await sql`UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = ${userId}`;
       return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- FORGOT PASSWORD ---
    if (action === "forgot_password") {
        if (!context.env.RESEND_API_KEY) return new Response(JSON.stringify({ error: "Erro de configuração: RESEND_API_KEY não encontrada." }), { status: 500, headers });

        const users = await sql`SELECT id, name FROM users WHERE email = ${email}`;
        if (users.length === 0) return new Response(JSON.stringify({ error: "E-mail não encontrado em nossa base." }), { status: 404, headers });

        const user = users[0];
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

        const requestUrl = new URL(context.request.url);
        const origin = requestUrl.origin;
        const resetLink = `${origin}/?token=${resetToken}`;

        await sql`DELETE FROM password_resets WHERE user_id = ${user.id}`;
        await sql`INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (${crypto.randomUUID()}, ${user.id}, ${resetToken}, ${expiresAt.toISOString()})`;

        try {
            const resend = new Resend(context.env.RESEND_API_KEY);
            const { error: resendError } = await resend.emails.send({
                from: 'SOS Controle <no-reply@sostec.top>',
                to: [email],
                subject: 'Recuperar Senha - SOS Controle',
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
            return new Response(JSON.stringify({ success: true, message: "Código e link enviados com sucesso!" }), { headers });
        } catch (err: any) {
            return new Response(JSON.stringify({ error: "Falha técnica ao processar e-mail." }), { status: 500, headers });
        }
    }

    // --- RESET PASSWORD CONFIRM ---
    if (action === "reset_password_confirm") {
        const resetRecord = await sql`SELECT * FROM password_resets WHERE token = ${token} AND expires_at > NOW() LIMIT 1`;
        if (resetRecord.length === 0) return new Response(JSON.stringify({ error: "Código inválido ou expirado." }), { status: 400, headers });

        const hashedNewPassword = await hashPassword(newPassword);
        await sql`UPDATE users SET password = ${hashedNewPassword} WHERE id = ${resetRecord[0].user_id}`;
        await sql`DELETE FROM password_resets WHERE id = ${resetRecord[0].id}`;

        return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- UPDATE PROFILE / PASSWORD ---
    if (action === "update_profile") {
      await sql`UPDATE users SET name=${userData.name}, phone=${userData.phone}, avatar=${userData.avatar} WHERE id=${userData.id}`;
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === "update_password") {
      const hashedCurrentPassword = await hashPassword(currentPassword);
      const userCheck = await sql`SELECT id FROM users WHERE id = ${userId} AND password = ${hashedCurrentPassword}`;
      if (userCheck.length === 0) return new Response(JSON.stringify({ error: "Senha atual incorreta." }), { status: 401, headers });
      
      const hashedNewPassword = await hashPassword(newPassword);
      await sql`UPDATE users SET password = ${hashedNewPassword} WHERE id = ${userId}`;
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Erro interno do servidor" }), { status: 500, headers });
  }
};
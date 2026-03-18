import { getDb } from "../../lib/db";
import { getSecurityHeaders } from "../../lib/security";
import jwt from '@tsndr/cloudflare-worker-jwt';

type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  params: any;
  waitUntil: any;
  next: any;
  data: any;
}) => Response | Promise<Response>;

const headers = getSecurityHeaders();

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers });
};

export const onRequestGet: PagesFunction<{ DATABASE_URL: string, JWT_SECRET: string }> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "Falta o userId" }), { status: 400, headers });
    }

    // ==========================================
    // 🔒 1. O GUARDA DA PORTA: VERIFICA O CRACHÁ
    // ==========================================
    const cookieHeader = context.request.headers.get("Cookie");
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
      const authHeader = context.request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
       return new Response(JSON.stringify({ error: "Acesso Negado. O Token não foi fornecido." }), { status: 401, headers });
    }
    const secret = context.env.JWT_SECRET;
    if (!secret) {
        return new Response(JSON.stringify({ error: "Erro de configuração: JWT_SECRET não definida." }), { status: 500, headers });
    }

    // 🔒 2. VERIFICA SE O CRACHÁ É FALSO OU ESTÁ EXPIRADO
    const isValid = await jwt.verify(token, secret);
    if (!isValid) {
       return new Response(JSON.stringify({ error: "Token inválido ou expirado. Faça login novamente." }), { status: 401, headers });
    }

    // 🔒 3. VERIFICA SE O CRACHÁ PERTENCE À PESSOA CERTA (Evita ataques IDOR)
    const { payload } = jwt.decode(token);
    const authUserId = (payload as any).id;
    
    if (userId && authUserId !== userId) {
       return new Response(JSON.stringify({ error: "Acesso não autorizado a estes dados." }), { status: 403, headers });
    }
    
    const targetUserId = authUserId; // Usar sempre o ID do token por segurança
    // ==========================================
    // 🔓 FIM DA SEGURANÇA. A PORTA FOI ABERTA!
    // ==========================================

    const sql = getDb(context.env.DATABASE_URL);

    // Busca os dados no banco
    const transactions = await sql`SELECT * FROM transactions WHERE user_id = ${targetUserId} ORDER BY date DESC`;
    const categories = await sql`SELECT * FROM categories WHERE user_id = ${targetUserId}`;
    const wallets = await sql`SELECT * FROM wallets WHERE user_id = ${targetUserId}`;
    const budgets = await sql`SELECT * FROM budgets WHERE user_id = ${targetUserId}`;
    const rules = await sql`SELECT * FROM rules WHERE user_id = ${targetUserId}`;
    const recurrenceExceptions = await sql`SELECT * FROM recurrence_exceptions WHERE user_id = ${targetUserId}`;

    const data = {
      transactions,
      categories,
      wallets,
      budgets,
      rules,
      recurrenceExceptions
    };

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Erro interno do servidor" }), { status: 500, headers });
  }
};
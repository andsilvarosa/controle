import { getDb } from "../../lib/db";
import jwt from '@tsndr/cloudflare-worker-jwt';

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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers });
};

export const onRequestPost: PagesFunction<{ DATABASE_URL: string, JWT_SECRET: string }> = async (context) => {
  try {
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
       return new Response(JSON.stringify({ error: "Acesso Negado." }), { status: 401, headers });
    }
    const secret = context.env.JWT_SECRET || 'minha_chave_super_secreta_123';
    
    if (!(await jwt.verify(token, secret))) {
       return new Response(JSON.stringify({ error: "Token inválido." }), { status: 401, headers });
    }
    const { payload } = jwt.decode(token);

    const sql = getDb(context.env.DATABASE_URL);
    const body: any = await context.request.json();
    const { action, wallet, id, userId } = body;

    if ((payload as any).id !== userId) {
        return new Response(JSON.stringify({ error: "Acesso não autorizado." }), { status: 403, headers });
    }

    if (action === "create") {
      await sql`
        INSERT INTO wallets (id, user_id, name, type, color, balance, currency, exchange_rate) 
        VALUES (
            ${wallet.id}, ${userId}, ${wallet.name}, ${wallet.type}, 
            ${wallet.color}, ${wallet.balance}, ${wallet.currency || 'BRL'}, ${wallet.exchangeRate || 1}
        )
      `;
    } else if (action === "update") {
      await sql`
        UPDATE wallets 
        SET name=${wallet.name}, type=${wallet.type}, color=${wallet.color}, 
            balance=${wallet.balance}, currency=${wallet.currency || 'BRL'}, exchange_rate=${wallet.exchangeRate || 1} 
        WHERE id=${wallet.id} AND user_id=${userId}
      `;
    } else if (action === "delete") {
      await sql`DELETE FROM wallets WHERE id=${id} AND user_id=${userId}`;
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error: any) {
    console.error("Database Wallet Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Falha ao salvar carteira" }), { status: 500, headers });
  }
};
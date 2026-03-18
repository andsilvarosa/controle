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
    const secret = context.env.JWT_SECRET;
    if (!secret) {
        return new Response(JSON.stringify({ error: "Erro de configuração: JWT_SECRET não definida." }), { status: 500, headers });
    }
    
    if (!(await jwt.verify(token, secret))) {
       return new Response(JSON.stringify({ error: "Token inválido." }), { status: 401, headers });
    }
    const { payload } = jwt.decode(token);
    const authUserId = (payload as any).id;

    const sql = getDb(context.env.DATABASE_URL);
    const body: any = await context.request.json();
    const { action, category, id, userId } = body;

    if (userId && authUserId !== userId) {
        return new Response(JSON.stringify({ error: "Acesso não autorizado." }), { status: 403, headers });
    }

    const targetUserId = authUserId;

    if (action === "create") {
      await sql`INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (${category.id}, ${targetUserId}, ${category.name}, ${category.icon}, ${category.color}, ${category.type})`;
    } else if (action === "update") {
      await sql`UPDATE categories SET name=${category.name}, icon=${category.icon}, color=${category.color}, type=${category.type} WHERE id=${category.id} AND user_id=${targetUserId}`;
    } else if (action === "delete") {
      await sql`DELETE FROM categories WHERE id=${id} AND user_id=${targetUserId}`;
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
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
    const authHeader = context.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return new Response(JSON.stringify({ error: "Acesso Negado." }), { status: 401, headers });
    }

    const token = authHeader.split(" ")[1];
    const secret = context.env.JWT_SECRET || 'minha_chave_super_secreta_123';
    
    if (!(await jwt.verify(token, secret))) {
       return new Response(JSON.stringify({ error: "Token inválido." }), { status: 401, headers });
    }
    const { payload } = jwt.decode(token);

    const sql = getDb(context.env.DATABASE_URL);
    const body: any = await context.request.json();
    const { action, rule, id, userId } = body;

    if (payload.id !== userId) {
        return new Response(JSON.stringify({ error: "Acesso não autorizado." }), { status: 403, headers });
    }

    if (action === "create") {
      await sql`INSERT INTO rules (id, user_id, active, condition, category_id) VALUES (${rule.id}, ${userId}, ${rule.active ? 1 : 0}, ${rule.condition}, ${rule.categoryId})`;
    } else if (action === "update") {
      await sql`UPDATE rules SET active=${rule.active ? 1 : 0}, condition=${rule.condition}, category_id=${rule.categoryId} WHERE id=${rule.id} AND user_id=${userId}`;
    } else if (action === "delete") {
      await sql`DELETE FROM rules WHERE id=${id} AND user_id=${userId}`;
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
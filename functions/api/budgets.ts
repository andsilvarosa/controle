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
    const { action, budget, id, userId } = body;

    if (payload.id !== userId) {
        return new Response(JSON.stringify({ error: "Acesso não autorizado." }), { status: 403, headers });
    }

    if (action === "create") {
      const check = await sql`SELECT id FROM budgets WHERE user_id = ${userId} AND category_id = ${budget.categoryId}`;
      if (check.length > 0) {
        await sql`UPDATE budgets SET amount=${budget.amount} WHERE user_id=${userId} AND category_id=${budget.categoryId}`;
      } else {
        await sql`INSERT INTO budgets (id, user_id, category_id, amount, period) VALUES (${budget.id}, ${userId}, ${budget.categoryId}, ${budget.amount}, ${budget.period || 'monthly'})`;
      }
    } else if (action === "update") {
      await sql`UPDATE budgets SET amount=${budget.amount}, category_id=${budget.categoryId} WHERE id=${budget.id} AND user_id=${userId}`;
    } else if (action === "delete") {
      await sql`DELETE FROM budgets WHERE id=${id} AND user_id=${userId}`;
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
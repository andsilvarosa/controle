import { getDb } from "../../lib/db";
import { getSecurityHeaders, sanitizeInput, logAction } from "../../lib/security";
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

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get("Origin");
  const headers = getSecurityHeaders(origin);
  return new Response(null, { status: 204, headers });
};

export const onRequestPost: PagesFunction<{ DATABASE_URL: string, JWT_SECRET: string }> = async (context) => {
  const origin = context.request.headers.get("Origin");
  const headers = getSecurityHeaders(origin);
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
    const { action, rule, id, userId } = body;

    if (userId && authUserId !== userId) {
        return new Response(JSON.stringify({ error: "Acesso não autorizado." }), { status: 403, headers });
    }

    const targetUserId = authUserId;

    if (action === "create") {
      const cleanCondition = sanitizeInput(rule.condition);
      await sql("INSERT INTO rules (id, user_id, active, condition, category_id) VALUES ($1, $2, $3, $4, $5)", [rule.id, targetUserId, rule.active ? 1 : 0, cleanCondition, rule.categoryId]);
      await logAction(sql, targetUserId, "RULE_CREATE", `Criou regra para categoria ${rule.categoryId}.`, context.request);
    } else if (action === "update") {
      const cleanCondition = sanitizeInput(rule.condition);
      await sql("UPDATE rules SET active=$1, condition=$2, category_id=$3 WHERE id=$4 AND user_id=$5", [rule.active ? 1 : 0, cleanCondition, rule.categoryId, rule.id, targetUserId]);
      await logAction(sql, targetUserId, "RULE_UPDATE", `Atualizou regra ${rule.id}.`, context.request);
    } else if (action === "delete") {
      await sql("DELETE FROM rules WHERE id=$1 AND user_id=$2", [id, targetUserId]);
      await logAction(sql, targetUserId, "RULE_DELETE", `Excluiu regra ${id}.`, context.request);
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
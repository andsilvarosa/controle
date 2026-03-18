import { getDb } from "../../lib/db";
import { getSecurityHeaders, logAction } from "../../lib/security";
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
    const currentSessionId = (payload as any).sid;

    const sql = getDb(context.env.DATABASE_URL);
    const body: any = await context.request.json();
    const { action, sessionId } = body;

    if (action === "list") {
      const sessions = await sql("SELECT id, user_agent, ip_address, last_active, created_at FROM sessions WHERE user_id = $1 ORDER BY last_active DESC", [authUserId]);
      
      // Marcar a sessão atual
      const sessionsWithCurrent = sessions.map((s: any) => ({
        ...s,
        isCurrent: s.id === currentSessionId
      }));

      return new Response(JSON.stringify(sessionsWithCurrent), { headers });
    } 
    else if (action === "revoke") {
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "ID da sessão é obrigatório." }), { status: 400, headers });
      }

      await sql("DELETE FROM sessions WHERE id = $1 AND user_id = $2", [sessionId, authUserId]);
      await logAction(sql, authUserId, "SESSION_REVOKE", `Sessão ${sessionId} revogada remotamente.`, context.request);

      return new Response(JSON.stringify({ success: true }), { headers });
    }
    else if (action === "revoke_others") {
      await sql("DELETE FROM sessions WHERE user_id = $1 AND id != $2", [authUserId, currentSessionId]);
      await logAction(sql, authUserId, "SESSION_REVOKE_OTHERS", "Todas as outras sessões foram revogadas.", context.request);

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "Ação inválida." }), { status: 400, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

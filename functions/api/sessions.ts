import { getDb } from "../../lib/db";
import { getSecurityHeaders, logAction, validateSession } from "../../lib/security";

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
    const sql = getDb(context.env.DATABASE_URL);
    
    // ==========================================
    // 🔒 1. VALIDAÇÃO DE SESSÃO CENTRALIZADA
    // ==========================================
    const session = await validateSession(context.request, context.env.JWT_SECRET, sql, context.waitUntil);
    
    if (!session.isValid) {
      return new Response(JSON.stringify({ error: session.error }), { status: session.status, headers });
    }

    const authUserId = session.userId!;
    const currentSessionId = session.sessionId!;
    // ==========================================

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

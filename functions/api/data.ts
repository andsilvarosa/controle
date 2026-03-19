import { getDb } from "../../lib/db";
import { getSecurityHeaders, validateSession } from "../../lib/security";

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

export const onRequestGet: PagesFunction<{ DATABASE_URL: string, JWT_SECRET: string }> = async (context) => {
  const origin = context.request.headers.get("Origin");
  const headers = getSecurityHeaders(origin);
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "Falta o userId" }), { status: 400, headers });
    }

    const sql = getDb(context.env.DATABASE_URL);
    const secret = context.env.JWT_SECRET;

    // ==========================================
    // 🔒 1. O GUARDA DA PORTA: VERIFICA O CRACHÁ E A SESSÃO
    // ==========================================
    const session = await validateSession(context.request, secret, sql, context.waitUntil);
    if (!session.isValid) {
       return new Response(JSON.stringify({ error: session.error }), { status: session.status, headers });
    }

    const authUserId = session.userId;
    
    if (userId && authUserId !== userId) {
       return new Response(JSON.stringify({ error: "Acesso não autorizado a estes dados." }), { status: 403, headers });
    }
    
    const targetUserId = authUserId; // Usar sempre o ID do token por segurança
    // ==========================================
    // 🔓 FIM DA SEGURANÇA. A PORTA FOI ABERTA!
    // ==========================================

    // Busca os dados no banco
    const transactions = await sql("SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC", [targetUserId]);
    const categories = await sql("SELECT * FROM categories WHERE user_id = $1", [targetUserId]);
    const wallets = await sql("SELECT * FROM wallets WHERE user_id = $1", [targetUserId]);
    const budgets = await sql("SELECT * FROM budgets WHERE user_id = $1", [targetUserId]);
    const rules = await sql("SELECT * FROM rules WHERE user_id = $1", [targetUserId]);
    const recurrenceExceptions = await sql("SELECT * FROM recurrence_exceptions WHERE user_id = $1", [targetUserId]);

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
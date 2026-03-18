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
    const secret = context.env.JWT_SECRET || 'minha_chave_super_secreta_123';

    const isValid = await jwt.verify(token, secret);
    if (!isValid) {
       return new Response(JSON.stringify({ error: "Token inválido ou expirado. Faça login novamente." }), { status: 401, headers });
    }
    
    const { payload } = jwt.decode(token);
    // ==========================================

    const sql = getDb(context.env.DATABASE_URL);
    const body: any = await context.request.json();
    const { action, transaction, id, userId, scope, exceptionDate, masterId } = body; 

    // 🔒 3. VALIDAÇÃO ANTI-HACKER (IDOR)
    if ((payload as any).id !== userId) {
        return new Response(JSON.stringify({ error: "Acesso não autorizado a estes dados." }), { status: 403, headers });
    }

    const sanitizeUUID = (val: any) => {
        if (!val) return null;
        if (typeof val !== 'string') return null;
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : null;
    };

    const cleanDate = (d: string) => {
        if (!d) return null;
        if (typeof d !== 'string') return null;
        return d.includes('T') ? d.split('T')[0] : d;
    };

    const updateWalletBalance = async (walletId: string, amount: number, type: string, reverse: boolean = false) => {
      if (!walletId) return;
      let adjustment = type === 'income' ? amount : -amount;
      if (reverse) adjustment = -adjustment;
      try {
         await sql`UPDATE wallets SET balance = balance + ${adjustment} WHERE id = ${walletId}`;
      } catch (e) { console.error("Wallet update failed", e); }
    };

    if (action === "create" || action === "bulk_create") {
      const txs = action === "bulk_create" ? body.transactions : [transaction];
      
      for (const t of txs) {
        const isRecurring = t.recurrence !== 'none' || (t.installments && t.installments > 1);
        
        await sql`
          INSERT INTO transactions (
            id, user_id, description, amount, date, due_date, category_id, type, 
            is_paid, notes, recurrence, installments, wallet_id, is_recurring, master_id
          ) VALUES (
            ${t.id}, ${userId}, ${t.description}, ${Number(t.amount).toFixed(2)}, ${cleanDate(t.date)}, ${cleanDate(t.dueDate)}, 
            ${sanitizeUUID(t.categoryId)}, ${t.type}, ${t.isPaid ? 1 : 0}, ${t.notes}, 
            ${t.recurrence}, ${t.installments || 1}, ${sanitizeUUID(t.walletId)}, ${isRecurring}, ${sanitizeUUID(t.masterId)}
          )
        `;

        if (t.isPaid && t.walletId) {
          await updateWalletBalance(t.walletId, Number(t.amount), t.type, false);
        }
      }
    } 
    else if (action === "create_override") {
        const safeMasterId = sanitizeUUID(masterId);
        const safeExceptionDate = cleanDate(exceptionDate);

        if (!safeMasterId) throw new Error("Erro Crítico: Master ID é obrigatório para criar exceção.");
        if (!safeExceptionDate) throw new Error("Erro Crítico: Data da exceção é obrigatória.");

        const safeAmount = Number(transaction.amount).toFixed(2);
        const safePaid = transaction.isPaid ? 1 : 0;
        const safeWalletId = sanitizeUUID(transaction.walletId);
        const safeCategoryId = sanitizeUUID(transaction.categoryId);
        const safeNotes = transaction.notes || '';
        const safeDate = cleanDate(transaction.date);
        const safeDueDate = cleanDate(transaction.dueDate);

        await sql`
            INSERT INTO transactions (
                id, user_id, description, amount, date, due_date, 
                category_id, type, is_paid, notes, 
                recurrence, installments, wallet_id, is_recurring, master_id
            ) VALUES (
                ${transaction.id}, 
                ${userId}, 
                ${transaction.description}, 
                ${safeAmount}, 
                ${safeDate}, 
                ${safeDueDate}, 
                ${safeCategoryId}, 
                ${transaction.type}, 
                ${safePaid}, 
                ${safeNotes}, 
                'none', 
                1, 
                ${safeWalletId}, 
                false, 
                ${safeMasterId}
            )
        `;

        const exceptionId = crypto.randomUUID();
        
        const existingException = await sql`
            SELECT id FROM recurrence_exceptions 
            WHERE transaction_id = ${safeMasterId} AND excluded_date = ${safeExceptionDate}
        `;

        if (existingException.length === 0) {
            await sql`
                INSERT INTO recurrence_exceptions (id, user_id, transaction_id, excluded_date)
                VALUES (${exceptionId}, ${userId}, ${safeMasterId}, ${safeExceptionDate})
            `;
        }

        if (transaction.isPaid && safeWalletId) {
            await updateWalletBalance(safeWalletId, Number(transaction.amount), transaction.type, false);
        }
    }
    else if (action === "update") {
      const oldRows = await sql`SELECT * FROM transactions WHERE id=${transaction.id} AND user_id=${userId}`;
      if (oldRows.length > 0) {
        const oldT = oldRows[0];
        const wasPaid = oldT.is_paid === 1 || oldT.is_paid === true;
        if (wasPaid && oldT.wallet_id) {
          await updateWalletBalance(oldT.wallet_id, Number(oldT.amount), oldT.type, true);
        }
      }

      await sql`
        UPDATE transactions SET 
          description=${transaction.description}, 
          amount=${Number(transaction.amount).toFixed(2)}, 
          date=${cleanDate(transaction.date)}, 
          due_date=${cleanDate(transaction.dueDate)}, 
          category_id=${sanitizeUUID(transaction.categoryId)}, 
          type=${transaction.type}, 
          is_paid=${transaction.isPaid ? 1 : 0}, 
          notes=${transaction.notes}, 
          recurrence=${transaction.recurrence || 'none'}, 
          installments=${transaction.installments || 1}, 
          wallet_id=${sanitizeUUID(transaction.walletId)} 
        WHERE id=${transaction.id} AND user_id=${userId}
      `;

      if (transaction.isPaid && transaction.walletId) {
        await updateWalletBalance(transaction.walletId, Number(transaction.amount), transaction.type, false);
      }
    } 
    else if (action === "delete") {
      if (scope === 'single' && exceptionDate) {
         const exceptionId = crypto.randomUUID();
         const safeExceptionDate = cleanDate(exceptionDate);
         
         const existingEx = await sql`SELECT id FROM recurrence_exceptions WHERE transaction_id = ${id} AND excluded_date = ${safeExceptionDate}`;
         if (existingEx.length === 0) {
             await sql`
                INSERT INTO recurrence_exceptions (id, user_id, transaction_id, excluded_date)
                VALUES (${exceptionId}, ${userId}, ${id}, ${safeExceptionDate})
             `;
         }
      } else {
          const rows = await sql`SELECT * FROM transactions WHERE id = ${id} AND user_id = ${userId}`;
          if (rows.length > 0) {
            const t = rows[0];
            const wasPaid = t.is_paid === 1 || t.is_paid === true;
            if (wasPaid && t.wallet_id) {
              await updateWalletBalance(t.wallet_id, Number(t.amount), t.type, true);
            }
          }
          await sql`DELETE FROM transactions WHERE (id = ${id} OR master_id = ${id}) AND user_id = ${userId}`;
          await sql`DELETE FROM recurrence_exceptions WHERE transaction_id = ${id}`;
      }
    } 

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error: any) {
    console.error("API Error in Transactions:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
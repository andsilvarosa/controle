import { getDb } from "../../lib/db";
import { getSecurityHeaders, sanitizeInput, logAction, validateSession } from "../../lib/security";

type PagesFunction<T = any> = (context: {
    request: Request;
    env: T;
    params: any;
    waitUntil: any;
    next: any;
    data: any;
}) => Response | Promise<Response>;

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
    // ==========================================

    const body: any = await context.request.json();
    const { action, transaction, id, userId, scope, exceptionDate, masterId } = body; 

    // 🔒 3. VALIDAÇÃO ANTI-HACKER (IDOR)
    if (userId && authUserId !== userId) {
        return new Response(JSON.stringify({ error: "Acesso não autorizado a estes dados." }), { status: 403, headers });
    }

    const targetUserId = authUserId; // Usar sempre o ID do token por segurança

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
         await sql("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [adjustment, walletId]);
      } catch (e) { console.error("Wallet update failed", e); }
    };

    if (action === "create" || action === "bulk_create") {
      const txs = action === "bulk_create" ? body.transactions : [transaction];
      
      for (const t of txs) {
        const isRecurring = t.recurrence !== 'none' || (t.installments && t.installments > 1);
        const cleanDescription = sanitizeInput(t.description);
        const cleanNotes = sanitizeInput(t.notes || "");
        
        await sql(`
          INSERT INTO transactions (
            id, user_id, description, amount, date, due_date, category_id, type, 
            is_paid, notes, recurrence, installments, wallet_id, is_recurring, master_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
          )
        `, [
          t.id, targetUserId, cleanDescription, Number(t.amount).toFixed(2), cleanDate(t.date), cleanDate(t.dueDate), 
          sanitizeUUID(t.categoryId), t.type, t.isPaid ? 1 : 0, cleanNotes, 
          t.recurrence, t.installments || 1, sanitizeUUID(t.walletId), isRecurring, sanitizeUUID(t.masterId)
        ]);

        if (t.isPaid && t.walletId) {
          await updateWalletBalance(t.walletId, Number(t.amount), t.type, false);
        }
      }
      await logAction(sql, targetUserId, action === "bulk_create" ? "TRANSACTION_BULK_CREATE" : "TRANSACTION_CREATE", `Criou ${txs.length} transação(ões).`, context.request);
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
        const safeDescription = sanitizeInput(transaction.description);
        const safeNotes = sanitizeInput(transaction.notes || '');
        const safeDate = cleanDate(transaction.date);
        const safeDueDate = cleanDate(transaction.dueDate);

        await sql(`
            INSERT INTO transactions (
                id, user_id, description, amount, date, due_date, 
                category_id, type, is_paid, notes, 
                recurrence, installments, wallet_id, is_recurring, master_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            )
        `, [
            transaction.id, 
            targetUserId, 
            safeDescription, 
            safeAmount, 
            safeDate, 
            safeDueDate, 
            safeCategoryId, 
            transaction.type, 
            safePaid, 
            safeNotes, 
            'none', 
            1, 
            safeWalletId, 
            false, 
            safeMasterId
        ]);

        const exceptionId = crypto.randomUUID();
        
        const existingException = await sql("SELECT id FROM recurrence_exceptions WHERE transaction_id = $1 AND excluded_date = $2", [safeMasterId, safeExceptionDate]);

        if (existingException.length === 0) {
            await sql("INSERT INTO recurrence_exceptions (id, user_id, transaction_id, excluded_date) VALUES ($1, $2, $3, $4)", [exceptionId, targetUserId, safeMasterId, safeExceptionDate]);
        }

        if (transaction.isPaid && safeWalletId) {
            await updateWalletBalance(safeWalletId, Number(transaction.amount), transaction.type, false);
        }
        await logAction(sql, targetUserId, "TRANSACTION_OVERRIDE", `Criou exceção para transação recorrente ${safeMasterId}.`, context.request);
    }
    else if (action === "update") {
      const oldRows = await sql("SELECT * FROM transactions WHERE id=$1 AND user_id=$2", [transaction.id, targetUserId]);
      if (oldRows.length > 0) {
        const oldT = oldRows[0];
        const wasPaid = oldT.is_paid === 1 || oldT.is_paid === true;
        if (wasPaid && oldT.wallet_id) {
          await updateWalletBalance(oldT.wallet_id, Number(oldT.amount), oldT.type, true);
        }
      }

      const cleanDescription = sanitizeInput(transaction.description);
      const cleanNotes = sanitizeInput(transaction.notes || "");

      await sql(`
        UPDATE transactions SET 
          description=$1, 
          amount=$2, 
          date=$3, 
          due_date=$4, 
          category_id=$5, 
          type=$6, 
          is_paid=$7, 
          notes=$8, 
          recurrence=$9, 
          installments=$10, 
          wallet_id=$11 
        WHERE id=$12 AND user_id=$13
      `, [
          cleanDescription, 
          Number(transaction.amount).toFixed(2), 
          cleanDate(transaction.date), 
          cleanDate(transaction.dueDate), 
          sanitizeUUID(transaction.categoryId), 
          transaction.type, 
          transaction.isPaid ? 1 : 0, 
          cleanNotes, 
          transaction.recurrence || 'none', 
          transaction.installments || 1, 
          sanitizeUUID(transaction.walletId),
          transaction.id,
          targetUserId
      ]);

      if (transaction.isPaid && transaction.walletId) {
        await updateWalletBalance(transaction.walletId, Number(transaction.amount), transaction.type, false);
      }
      await logAction(sql, targetUserId, "TRANSACTION_UPDATE", `Atualizou transação ${transaction.id}.`, context.request);
    } 
    else if (action === "delete") {
      if (scope === 'single' && exceptionDate) {
         const exceptionId = crypto.randomUUID();
         const safeExceptionDate = cleanDate(exceptionDate);
         
         const existingEx = await sql("SELECT id FROM recurrence_exceptions WHERE transaction_id = $1 AND excluded_date = $2", [id, safeExceptionDate]);
         if (existingEx.length === 0) {
             await sql("INSERT INTO recurrence_exceptions (id, user_id, transaction_id, excluded_date) VALUES ($1, $2, $3, $4)", [exceptionId, targetUserId, id, safeExceptionDate]);
         }
         await logAction(sql, targetUserId, "TRANSACTION_DELETE_SINGLE", `Excluiu ocorrência de ${id} em ${safeExceptionDate}.`, context.request);
      } else {
          const rows = await sql("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [id, targetUserId]);
          if (rows.length > 0) {
            const t = rows[0];
            const wasPaid = t.is_paid === 1 || t.is_paid === true;
            if (wasPaid && t.wallet_id) {
              await updateWalletBalance(t.wallet_id, Number(t.amount), t.type, true);
            }
          }
          await sql("DELETE FROM transactions WHERE (id = $1 OR master_id = $2) AND user_id = $3", [id, id, targetUserId]);
          await sql("DELETE FROM recurrence_exceptions WHERE transaction_id = $1", [id]);
          await logAction(sql, targetUserId, "TRANSACTION_DELETE", `Excluiu transação ${id} (e suas recorrências).`, context.request);
      }
    } 

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error: any) {
    console.error("API Error in Transactions:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
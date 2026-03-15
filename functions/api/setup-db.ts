import { getDb, initSchema } from "../../lib/db";

// Endpoint isolado e protegido para rodar o DDL (Create Tables) do seu banco Neon
export const onRequestPost = async (context: any) => {
  try {
    const body = await context.request.json();
    
    // 🔒 Proteção: Você precisa enviar a senha de admin configurada no Cloudflare
    // Crie a variável ADMIN_SECRET lá no painel (Settings > Environment Variables)
    if (body.adminSecret !== context.env.ADMIN_SECRET) {
       return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
    }

    const sql = getDb(context.env.DATABASE_URL);
    await initSchema(sql);
    
    return new Response(JSON.stringify({ 
        success: true, 
        message: "Migrations executadas com sucesso no banco de dados!" 
    }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

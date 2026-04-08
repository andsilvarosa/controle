import { Pool } from '@neondatabase/serverless';
import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    let user = null;
    
    const { action, payload } = await request.json();

    const publicActions = ['login', 'register'];
    if (!publicActions.includes(action)) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      const token = authHeader.split(' ')[1];
      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
      }
      const { payload: jwtPayload } = jwt.decode(token);
      user = jwtPayload;
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });

    let result = null;
    switch (action) {
      case 'ping':
        result = { message: 'pong', user };
        break;
      case 'createTransaction':
        // Implementation for createTransaction
        result = { message: 'Transaction created (mock)', payload };
        break;
      case 'getTransactions':
        // Implementation for getTransactions
        result = { message: 'Transactions fetched (mock)', payload };
        break;
      // Add other commands here
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

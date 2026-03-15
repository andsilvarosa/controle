import express from "express";
console.log("Starting server.ts...");
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock API routes for SOS Controle
  // In a real scenario, these would connect to the DB
  app.get("/api/data", (req, res) => {
    const { userId } = req.query;
    console.log(`[GET] /api/data - Fetching data for user: ${userId}`);
    
    // Return empty data or mock data to prevent app crash
    res.json({
      transactions: [],
      categories: [
        { id: '1', name: 'Alimentação', icon: 'Utensils', color: '#f59e0b', type: 'expense' },
        { id: '2', name: 'Salário', icon: 'DollarSign', color: '#10b981', type: 'income' }
      ],
      rules: [],
      wallets: [
        { id: 'w1', name: 'Carteira Principal', type: 'checking', color: '#0f172a', balance: 0 }
      ],
      budgets: [],
      recurrenceExceptions: []
    });
  });

  app.get("/api/auth", (req, res) => {
    res.json({ message: "Auth endpoint is alive. Use POST for login." });
  });

  app.post("/api/auth", (req, res) => {
    console.log(`[POST] /api/auth - Body:`, req.body);
    const { action, email, password } = req.body;
    if (action === 'login') {
      // Mock login
      res.json({
        user: { id: 'user-123', name: 'Usuário Demo', email, avatar: 'https://picsum.photos/seed/user/200' },
        token: 'mock-token'
      });
    } else {
      res.status(400).json({ error: 'Action not supported in demo' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

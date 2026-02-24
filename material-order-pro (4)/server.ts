import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("orders.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    zip_code TEXT,
    address TEXT,
    items TEXT,
    subtotal INTEGER,
    tax INTEGER,
    shipping INTEGER,
    total INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    res.json(orders.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items)
    })));
  });

  app.post("/api/orders", (req, res) => {
    const { customerName, zipCode, address, items, subtotal, tax, shipping, total } = req.body;
    const info = db.prepare(`
      INSERT INTO orders (customer_name, zip_code, address, items, subtotal, tax, shipping, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(customerName, zipCode, address, JSON.stringify(items), subtotal, tax, shipping, total);
    
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/orders/:id/shipping", (req, res) => {
    const { id } = req.params;
    const { shipping, total } = req.body;
    db.prepare("UPDATE orders SET shipping = ?, total = ? WHERE id = ?").run(shipping, total, id);
    res.json({ success: true });
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

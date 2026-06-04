require('dotenv').config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const childrenRoutes = require("./routes/children");
const gamesRoutes = require("./routes/games");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");

const app = express();

// ── CORS Configuration (Development & Production) ────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5000',
];

// Add production frontend URL if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ NeuroNest Backend Running...");
});

app.use("/api/children", childrenRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// ── Auto-create tables on startup ────────────────────────────────────────────
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        display_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log("✅ Database tables verified / created");
  } catch (err) {
    console.error("❌ Failed to initialize database tables:", err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  await initDatabase();
});

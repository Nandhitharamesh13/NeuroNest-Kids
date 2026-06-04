const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "neuronest_secret_key_2024";

// Helper: extract userId from Bearer token
function getUserId(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

// ── GET /api/children ─────────────────────────────────────────────────────────
// Get all children for the logged-in parent
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query(
      "SELECT id, name, age, avatar, created_at FROM child_profiles WHERE parent_id = $1 ORDER BY created_at ASC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get children error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/children ────────────────────────────────────────────────────────
// Add a new child profile
router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, age, avatar } = req.body;
  if (!name || !age) return res.status(400).json({ error: "Name and age required" });

  try {
    const result = await pool.query(
      "INSERT INTO child_profiles (parent_id, name, age, avatar) VALUES ($1,$2,$3,$4) RETURNING id, name, age, avatar, created_at",
      [userId, name.trim(), parseInt(age), avatar || "default"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add child error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT /api/children/:id ─────────────────────────────────────────────────────
// Update a child profile (only if it belongs to the logged-in parent)
router.put("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, age, avatar } = req.body;
  try {
    const result = await pool.query(
      "UPDATE child_profiles SET name=$1, age=$2, avatar=$3 WHERE id=$4 AND parent_id=$5 RETURNING id, name, age, avatar",
      [name.trim(), parseInt(age), avatar || "default", req.params.id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Child not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update child error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── DELETE /api/children/:id ──────────────────────────────────────────────────
// Delete a child profile (only if it belongs to the logged-in parent)
router.delete("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await pool.query(
      "DELETE FROM child_profiles WHERE id=$1 AND parent_id=$2",
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Delete child error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/children/name/:id ────────────────────────────────────────────────
router.get("/name/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name FROM child_profiles WHERE id=$1",
      [req.params.id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

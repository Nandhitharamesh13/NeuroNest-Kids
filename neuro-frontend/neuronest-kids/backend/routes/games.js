const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/save", async (req, res) => {
    const {
        child_id,
        game_type,
        score,
        correct_answers,
        total_questions,
        accuracy,
    } = req.body;

    await pool.query(
        `INSERT INTO game_sessions 
     (child_id, game_type, score, correct_answers, total_questions, accuracy)
     VALUES ($1,$2,$3,$4,$5,$6)`,
        [child_id, game_type, score, correct_answers, total_questions, accuracy]
    );

    res.json({ success: true });
});

module.exports = router;

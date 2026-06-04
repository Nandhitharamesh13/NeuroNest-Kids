const express = require('express');
const router = express.Router();

// ── POST /api/ai/difficulty ──────────────────────────────────────────────────
// Adaptive difficulty engine: adjusts level based on accuracy
router.post('/difficulty', (req, res) => {
    const { accuracy } = req.body;

    if (accuracy === undefined || accuracy === null) {
        return res.status(400).json({ error: 'accuracy is required' });
    }

    const acc = Number(accuracy);
    let difficulty;
    let message;

    if (acc >= 85) {
        difficulty = 'hard';
        message = "Amazing work! Let's try something more challenging! 🌟";
    } else if (acc >= 60) {
        difficulty = 'medium';
        message = "Good job! Keep going at this pace! 😊";
    } else {
        difficulty = 'easy';
        message = "Let's practice a bit more to build confidence! 💪";
    }

    res.json({ difficulty, message, accuracy: acc });
});

// ── POST /api/ai/hint ────────────────────────────────────────────────────────
router.post('/hint', (req, res) => {
    const { question, gameType } = req.body;
    const hints = {
        alphabet: "Look at the shape of the letter carefully! 🔤",
        numbers: "Try counting on your fingers! 🖐️",
        colors: "Think about things you see in nature! 🌈",
        shapes: "Look at the corners and sides! 🔷",
        default: "Take your time and think carefully! 🤔",
    };
    const hint = hints[gameType] || hints.default;
    res.json({ hint });
});

// ── POST /api/ai/encouragement ───────────────────────────────────────────────
router.post('/encouragement', (req, res) => {
    const messages = [
        "You're doing great! Every mistake helps you learn! 🌟",
        "Keep trying! You're getting better every second! 💪",
        "I believe in you! Let's try again! 🚀",
        "Practice makes perfect! You've got this! ⭐",
        "Don't give up! You're a learning superstar! 🌈",
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    res.json({ message });
});

module.exports = router;

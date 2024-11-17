const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 

// Route untuk menyimpan skor quiz
router.post('/submit', auth, async (req, res) => {
    const { quiz_id, score, user_answers } = req.body;
    const user_id = req.session.userId;  

    console.log("Received data:", { quiz_id, user_id, score, user_answers });

    if (!quiz_id || !user_id || score === undefined || !user_answers) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const client = await req.pool.connect();

        // Cek apakah pengguna sudah mengirimkan skor untuk quiz ini
        const checkQuery = `SELECT id FROM quiz_scores WHERE quiz_id = $1 AND user_id = $2`;
        const checkResult = await client.query(checkQuery, [quiz_id, user_id]);

        if (checkResult.rows.length > 0) {
            client.release();
            return res.status(400).json({ error: "You have already submitted this quiz" });
        }

        // Menyimpan skor ke tabel quiz_scores
        const insertQuery = `
            INSERT INTO quiz_scores (quiz_id, user_id, score, user_answers, quiz_date)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id
        `;
        const insertResult = await client.query(insertQuery, [quiz_id, user_id, score, JSON.stringify(user_answers)]);

        console.log("Insert successful, quiz_score_id:", insertResult.rows[0].id);
        client.release();
        res.status(200).json({ message: "Quiz score submitted successfully", quiz_score_id: insertResult.rows[0].id });
    } catch (error) {
        console.error("Database error during quiz score submission:", error.message);
        res.status(500).json({ error: "Failed to submit quiz score" });
    }
});

// Route untuk mengecek status pengerjaan quiz
router.get('/check-submission', auth, async (req, res) => {
    const { quiz_id } = req.query;
    const userId = req.session.userId; // Mengambil userId dari session

    if (!quiz_id || !userId) {
        return res.status(400).json({ error: 'Quiz ID and user authentication required.' });
    }

    try {
        const client = await req.pool.connect();
        const result = await client.query(
            'SELECT * FROM quiz_scores WHERE quiz_id = $1 AND user_id = $2',
            [quiz_id, userId]
        );
        client.release();

        // Mengecek apakah user sudah mengerjakan quiz tersebut
        if (result.rows.length > 0) {
            return res.json({ submitted: true });
        } else {
            return res.json({ submitted: false });
        }
    } catch (error) {
        console.error("Error checking quiz submission:", error);
        res.status(500).json({ error: "Failed to check submission status" });
    }
});

module.exports = router;

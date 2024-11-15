const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Route to submit exam score
router.post('/submit', async (req, res) => {
    const { exam_id, score } = req.body;
    const user_id = req.session.userId;  // Ensure user_id is set from session

    if (!exam_id || !user_id || score === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!user_id) {
        return res.status(401).json({ error: "User is not authenticated" });
    }

    try {
        const client = await req.pool.connect();

        // Check if the user has already submitted for this exam
        const checkQuery = `SELECT id FROM exam_submissions WHERE exam_id = $1 AND user_id = $2`;
        const checkResult = await client.query(checkQuery, [exam_id, user_id]);

        if (checkResult.rows.length > 0) {
            client.release();
            return res.status(400).json({ error: "You have already submitted this exam" });
        }

        // Insert submission into the database
        const insertQuery = `
            INSERT INTO exam_submissions (exam_id, user_id, score, submission_date)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id
        `;
        await client.query(insertQuery, [exam_id, user_id, score]);
        
        client.release();
        res.status(200).json({ message: "Exam submitted successfully" });
    } catch (error) {
        console.error("Database error during exam submission:", error);
        res.status(500).json({ error: "Failed to submit exam" });
    }
});

router.get('/check-submission', auth, async (req, res) => {
    const { exam_id } = req.query;
    const userId = req.session.userId; 

    if (!exam_id || !userId) {
        return res.status(400).json({ error: 'Exam ID and user authentication required.' });
    }

    try {
        const client = await req.pool.connect();
        const result = await client.query(
            'SELECT * FROM exam_submissions WHERE exam_id = $1 AND user_id = $2',
            [exam_id, userId]
        );
        client.release();

        if (result.rows.length > 0) {
            return res.json({ submitted: true });
        } else {
            return res.json({ submitted: false });
        }
    } catch (error) {
        console.error("Error checking submission:", error);
        res.status(500).json({ error: "Failed to check submission status" });
    }
});


module.exports = router;

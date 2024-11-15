const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt'); // Ensure bcrypt is required if it's used
const router = express.Router();

// Serve the register.html page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/register.html')); // Adjusted path
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/login.html')); // Adjust path as needed
});

router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/home.html')); // Adjust path as needed
});

// Registration route
router.post('/register', async (req, res) => {
    const { name, email, password, c_password } = req.body;

    if (!name || !email || !password || !c_password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== c_password) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    try {
        const client = await req.pool.connect();
        const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        );

        res.status(200).json({ message: "Registration successful" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const client = await req.pool.connect();
        const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "User not found." });
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        // Store userId in session
        req.session.userId = user.id;
        console.log("User ID stored in session:", req.session.userId);

        res.status(200).json({ message: "Login successful", userId: user.id, name: user.name });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to log in." });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to logout' });
        }
        res.redirect('/html/login.html'); // Adjusted path
    });
});

// Profile Route
router.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const client = await req.pool.connect();
        const result = await client.query('SELECT name FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json(user);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
});

// Route to check if the user has already submitted the exam
router.get('/check-submission', async (req, res) => {
    const { exam_id } = req.query;
    const user_id = req.session.userId;

    try {
        const client = await req.pool.connect();
        const checkQuery = `SELECT id FROM exam_submissions WHERE exam_id = $1 AND user_id = $2`;
        const result = await client.query(checkQuery, [exam_id, user_id]);
        client.release();

        res.json({ submitted: result.rows.length > 0 });
    } catch (error) {
        console.error("Error checking submission status:", error);
        res.status(500).json({ error: "Failed to check submission status" });
    }
});



module.exports = router;

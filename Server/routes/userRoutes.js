const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const multer = require('multer');

// Configure multer to store uploaded files in the "uploads" directory
const upload = multer({ dest: 'uploads/' });

// userRoutes.js (Server-side code)
router.post('/register', upload.single('profile_image'), async (req, res) => {
    const { name, email, password, c_password } = req.body;

    if (!name || !email || !password || !c_password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== c_password) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const client = await req.pool.connect();
        
        const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            // Return a 409 Conflict status specifically for duplicate emails
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

        await client.query(
            'INSERT INTO users (name, email, password, profile_image) VALUES ($1, $2, $3, $4)',
            [name, email, hashedPassword, profileImagePath]
        );

        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        console.error("Detailed registration error:", error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});


// 2. New route to get user profile data
router.get('/profile/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const client = await req.pool.connect();
        const result = await client.query(
            'SELECT name, email, profile_image FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).end();
    }

    try {
        const client = await req.pool.connect();
        const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).end();
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).end();
        }

        req.session.userId = user.id;
        res.status(200).end();
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).end();
    }
});


// Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to logout' });
        }
        res.redirect('/login.html'); // Redirect to login after logging out
    });
});

// Ensure this code is inside userRoutes.js
const path = require('path');

router.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId; // Assuming userId is stored in the session
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const client = await req.pool.connect();
        const userResult = await client.query('SELECT name, profile_image FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        
        // Convert the image path to a format accessible by the client if necessary
        user.profile_image = user.profile_image ? path.join('/uploads', path.basename(user.profile_image)) : null;

        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
});



module.exports = router;

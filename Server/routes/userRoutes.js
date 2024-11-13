const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const multer = require('multer');

// Configure multer to store uploaded files in the "uploads" directory
const upload = multer({ dest: 'uploads/' });

// Registration route with file upload handling
router.post('/register', upload.single('profile_image'), async (req, res) => {
    const { name, email, password, c_password } = req.body;

    // Step 1: Validate required fields
    if (!name || !email || !password || !c_password) {
        console.log("Missing required fields: name, email, or password.");
        return res.status(400).json({ error: "All fields are required" });
    }

    // Step 2: Validate password confirmation
    if (password !== c_password) {
        console.log("Password and confirmation do not match.");
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // Step 3: Connect to the database
        const client = await req.pool.connect();
        console.log("Database connection established.");

        // Step 4: Check if the email already exists
        console.log("Checking if email exists...");
        const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            console.log("Email already exists.");
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.log("Email check passed.");

        // Step 5: Hash the password
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully.");

        // Step 6: Prepare the profile image (if uploaded)
        let profileImagePath = null;
        if (req.file) {
            profileImagePath = req.file.path; // File path of the uploaded profile image
            console.log("Profile image uploaded at:", profileImagePath);
        }

        // Step 7: Insert the new user into the database
        console.log("Inserting user into database...");
        await client.query(
            'INSERT INTO users (name, email, password, profile_image) VALUES ($1, $2, $3, $4)',
            [name, email, hashedPassword, profileImagePath]
        );

        console.log("User registered successfully.");
        
        // Instead of sending a JSON response, redirect to login.html
        res.redirect('/login.html'); // Redirect to login page after registration

    } catch (error) {
        console.error("Detailed registration error:", error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});


// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Step 1: Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Step 2: Connect to the database and find the user by email
        const client = await req.pool.connect();
        const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        // Check if the user exists
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = userResult.rows[0];

        // Step 3: Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Step 4: Send a success response
        res.status(200).json({ message: "Login successful", userId: user.id });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to log in" });
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

module.exports = router;

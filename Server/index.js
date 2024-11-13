const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const cors = require('cors'); // Import CORS middleware
const userRoutes = require('./routes/userRoutes'); // Ensure this path is correct
const auth = require('./middleware/auth'); // Ensure this path is correct

const app = express();
const PORT = 3001; // Set the port number for the server

// Configure CORS with specific origin
app.use(cors({
    origin: ['http://localhost:3000', 'https://085-physics-virtual-49hghpnmc-dedys-projects-a843acc4.vercel.app/'], // Allow requests from both localhost and file origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// PostgreSQL configuration
const pool = new Pool({
    user: 'postgres',          // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'pawm',          // Replace with your database name
    password: 'Saragih123',    // Replace with your PostgreSQL password
    port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing test query', err.stack);
        }
        console.log('Connected to PostgreSQL:', result.rows);
    });
});

// Middleware to make the pool accessible in route files
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Session configuration using PostgreSQL as session store
app.use(session({
    store: new pgSession({
        pool: pool,                  // Use the PostgreSQL pool for session storage
        tableName: 'session',        // Table name for session storage in PostgreSQL
    }),
    secret: 'qwerty270404',       // Replace with a secure key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 }, // Cookie valid for 30 days
}));

// Body parsers for handling form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the entire root directory to make HTML files accessible
app.use(express.static(path.join(__dirname, '..')));

// Serve static files (CSS, JS, images) based on your specific directory structure
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes for handling user-related requests
app.use('/api/users', userRoutes);

// Route to serve `register.html`
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../register.html')); // Adjust to correct file path
});

// Protected route for `home.html` requiring authentication
app.get('/home', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../home.html')); // Adjust to correct file path
});

// Testing route to check if the server is running
app.get('/test', (req, res) => {
    res.send('Server is running');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Additional database connection test
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to database at:', res.rows[0].now);
    }
});

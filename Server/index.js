require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const auth = require('./middleware/auth');
const quizRoutes = require('./routes/quizRoutes');
const examRoutes = require('./routes/examRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS with specific origins
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Configure connection pool using DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});


// Export pool for usage in other files
module.exports = pool;

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        client.query('SELECT NOW()', (err, result) => {
            release();
            if (err) {
                console.error('Error executing test query', err.stack);
            } else {
                console.log('Connected to PostgreSQL:', result.rows);
            }
        });
    }
});

// Middleware to make the pool accessible in route files
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Configure session using PostgreSQL as session store
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
}));

// Body parsers for handling form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes); // User-related routes
app.use('/api/quiz', quizRoutes); // Quiz-related routes
app.use('/api/exams', auth, examRoutes); // Exam-related routes with auth middleware

// Serve HTML files
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/register.html'));
});

app.get('/home', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/home.html'));
});

// Testing route
app.get('/test', (req, res) => {
    res.send('Server is running');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

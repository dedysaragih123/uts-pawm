require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const examRoutes = require('./routes/examRoutes');
const auth = require('./middleware/auth');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://085-physics-virtual-aj0juuc0g-dedys-projects-a843acc4.vercel.app', 
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Configure PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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

// Session configuration
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'None',
    },
}));

// Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/exams', auth, examRoutes);

// Serve HTML files
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/register.html'));
});

app.get('/home', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/home.html'));
});

// Redirect root URL to login API
app.get('/', (req, res) => {
    res.redirect('/api/users/login');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

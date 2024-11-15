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
const app = express();
const PORT = 3001;

// Configure CORS with specific origin
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// PostgreSQL configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'pawm',
    password: 'Saragih123',
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
        pool: pool,
        tableName: 'session',
    }),
    secret: 'qwerty270404',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true, 
        maxAge: 30 * 24 * 60 * 60 * 1000
    },
}));

// Body parsers for handling form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes for handling user-related requests
app.use('/api/users', userRoutes);

// Route to serve HTML files
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/register.html'));
});

app.get('/home', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/home.html'));
});

// Testing route to check if the server is running
app.get('/test', (req, res) => {
    res.send('Server is running');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const protectedRouteHandler = (req, res) => {
    res.json({ message: "You have accessed a protected route!" });
};

const examRoutes = require('./routes/examRoutes');
app.use('/api/exams', auth, examRoutes);

app.use('/api/quiz', quizRoutes);
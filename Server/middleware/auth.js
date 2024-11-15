const auth = (req, res, next) => {
    console.log(`Authentication check for URL: ${req.originalUrl}`);
    if (req.session && req.session.userId) {
        console.log(`User authenticated: ${req.session.userId}`);
        next();
    } else {
        console.log('User not authenticated');
        if (req.originalUrl.startsWith('/api')) {
            res.status(401).json({ error: 'Unauthorized access' });
        } else {
            res.redirect('/html/login.html');
        }
    }
};

module.exports = auth;

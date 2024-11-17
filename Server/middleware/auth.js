const auth = (req, res, next) => {
    // Log waktu, URL, dan status autentikasi
    console.log(`[${new Date().toISOString()}] Authentication check for URL: ${req.originalUrl}`);
    
    // Periksa apakah sesi user tersedia
    if (req.session && req.session.userId) {
        console.log(`User authenticated. Session ID: ${req.sessionID}, User ID: ${req.session.userId}`);
        next(); // Lanjutkan ke handler berikutnya
    } else {
        console.log('User not authenticated or session expired.');
        
        // Tangani API dan non-API request
        if (req.originalUrl.startsWith('/api')) {
            res.status(401).json({ error: 'Unauthorized access. Please log in.' });
        } else {
            res.redirect('/html/login.html');
        }
    }
};

module.exports = auth;

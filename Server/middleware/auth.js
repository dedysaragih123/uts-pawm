// Server/middleware/auth.js
const auth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next(); // User is authenticated, proceed to the requested page
    } else {
        res.redirect('/login.html'); // User not authenticated, redirect to login page
    }
};

module.exports = auth;

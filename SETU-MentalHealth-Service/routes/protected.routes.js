// routes/protected.routes.js
const { Router } = require('express');
const { validateUser } = require('../middleware/simpleAuth');

const router = Router();

// Example protected route that requires authentication
router.get('/profile', validateUser, (req, res) => {
    // req.user contains the decoded JWT token data
    res.json({
        success: true,
        message: 'Protected route accessed successfully',
        user: req.user
    });
});

// Example protected route for user-specific data
router.get('/dashboard', validateUser, (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard data',
        userId: req.user.id,
        userRole: req.user.role
    });
});

module.exports = router;

const jwt = require('jsonwebtoken');

const validateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access token is required' 
            });
        }

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedToken;
            return next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token has expired. Please login again.' 
                });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Invalid access token' 
                });
            } else {
                console.error('Unexpected token error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Internal server error' 
                });
            }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = { validateUser };

const jwt = require('jsonwebtoken');
const axios = require('axios');

const validateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const refreshToken = req.headers['x-refresh-token'];

        console.log('JWT Validation Debug:', {
            hasAuthHeader: !!req.headers.authorization,
            tokenPresent: !!token,
            tokenStart: token ? token.substring(0, 20) + '...' : 'none',
            jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
        });

        if (!token) {
            return res.status(401).json({ message: 'Access token is required' });
        }

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            console.log('JWT Decoded successfully:', {
                userId: decodedToken.id,
                email: decodedToken.email,
                fullDecoded: decodedToken
            });
            req.user = decodedToken;
            return next(); // Access token valid → Proceed
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                console.log('Access token expired. Trying to refresh...');

                if (!refreshToken) {
                    return res.status(403).json({ message: 'Refresh token is required' });
                }

                try {
                    // ✅ Step 2: Call the Refresh Token API
                    const response = await axios.post(`${process.env.REFRESH_TOKEN_URL}`, {
                        refreshToken
                    });

                    const { accessToken, newRefreshToken } = response.data;

                    // ✅ Step 3: Update headers with new tokens
                    res.setHeader('Authorization', `Bearer ${accessToken}`);
                    res.setHeader('x-refresh-token', newRefreshToken);

                    // ✅ Step 4: Decode new token and proceed
                    const decodedNewToken = jwt.verify(accessToken, process.env.JWT_SECRET);
                    req.user = decodedNewToken;

                    return next(); // ✅ Proceed with new tokens
                } catch (refreshErr) {
                    console.error('Failed to refresh token:', refreshErr.response?.data || refreshErr.message);
                    return res.status(403).json({ message: 'Failed to refresh token. Please log in again.' });
                }
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid access token' });
            } else {
                console.error('Unexpected token error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { validateUser };

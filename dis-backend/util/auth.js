const jwt = require('jsonwebtoken');
const { createErrors } = require('../controllers/error');

const autheticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return next(createErrors.unauthorized('Access token is missing'));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(createErrors.unauthorized('Token format is invalid.'));
    }

    jwt.verify(token, 'secretfortoken', (err, user) => {
        if (err) {
            return next(createErrors.unauthorized('Invalid or expired token.'));
        }

        req.user = user;
        next();
    });
}

module.exports = autheticateToken;
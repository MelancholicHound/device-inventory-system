const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');

router.post(
    '/signup',
    [
        body('firstName').notEmpty(),
        body('middleName').notEmpty(),
        body('lastName').notEmpty(),
        body('positionId').notEmpty().isNumeric(),
        body('positionRanking').notEmpty().isNumeric(),
        body('email').isEmail().withMessage('Please enter a valid email.')
        .custom(async(email) => {
            const user = User.find(email);
            if (!user) {
                return Promise.reject('Email address already exist.');
            }
        }),
        body('password').isLength({ min: 8 })
    ], authController.signup
);

router.post('signup/otp', authController.verifyOTP);

module.exports = router;
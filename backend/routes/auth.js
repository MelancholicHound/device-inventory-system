const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');
const { scanExistingAccount } = require('../controllers/auth');

router.post('/signup', [
    body('firstName').notEmpty().isString(),
    body('middleName').notEmpty().isString(),
    body('lastName').notEmpty().isString(),
    body('positionId').notEmpty().isNumeric(),
    body('positionRanking').notEmpty().isNumeric(),
    body('email').notEmpty().isEmail().withMessage('Please enter a valid email.'),
    body('password').notEmpty().isLength({ min: 8 })
], authController.signup);

router.post('/signup/otp', authController.verifyOTP);

module.exports = router;
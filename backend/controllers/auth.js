const { validationResult } = require('express-validator');
const mailer = require('nodemailer');
const nodeCache = require('node-cache');

const User = require('../models/user');

require('dotenv').config();
const cache = new nodeCache();
let userDetails = {};

const transporter = mailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.email,
        pass: process.env.password
    }
});

function numericOTP(length) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits.charAt(randomIndex);
    }
    return otp;
}
 
function scanExistingAccount(email) {
    const accounts = User.getAll();
    const emailExists = '';
    for (let i = 0; i < accounts.length; i++) {
        if (email === accounts[i].email) {
            emailExists = accounts[i].email;
        }
    }
    return emailExists;
}

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return;

    const firstName = req.body.firstName;
    const middleName = req.body.middleName;
    const lastName = req.body.lastName;
    const positionId = req.body.positionId;
    const positionRanking = req.body.positionRanking;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = scanExistingAccount(email);

        if (user) {
            const error = new Error('This email is already taken. Please try another email.');
            error.statusCode = 400;
            throw error;
        }

        userDetails = {
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            positionId: positionId,
            positionRanking: positionRanking,
            email: email,
            password: password
        }

        const otp = numericOTP(4);
        const mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Your One-Time Password (OTP) for Secure Access',
            text: `Hello there ${firstName}! Here is your OTP: ${otp}`
        }

        await transporter.sendMail(mailOptions);
        cache.set('otp', otp);
        res.status(200).json({ message: "OTP sent to user's email. Proceed to verify"});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        } next(error);
    }
}

exports.verifyOTP = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return;

    const otp = req.body.otp;

    try {
        let storedOTP = cache.get('otp');

        if (!storedOTP || storedOTP !== otp) {
            const error = new Error('An error occured during validating OTP');
            error.status = 500;
            throw error;
        }

        cache.del('otp');
        User.save(userDetails);
        userDetails = {};
        res.status(200).json({ message: 'Verification complete.' });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        } next(error);
    }
}
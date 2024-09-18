const { validationResult } = require('express-validator');
const nodeMailer = require('nodemailer');
const nodeCache = require('node-cache');

const User = require('../models/user');

require('dotenv').config();
const cache = new nodeCache();

const tranporter = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

let userDetails = {};

function numericOTP(length) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits.charAt(randomIndex);
    }
    return otp;
}

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) return;

    const firstName = req.body.firstName;
    const middleName = req.body.middleName;
    const lastName = req.body.lastName;
    const positionId = req.body.positionId;
    const positionRanking = req.body.positionRanking;
    const email = req.body.email;
    const password = req.body.password;
 
    try {
        const user = User.find(email);

        if (!user) {
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
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: 'Your One-Time Password (OTP) for Secure Access',
            text: `Hello there ${firstName}! Here is your OTP: ${otp}`
        }
      
        await tranporter.sendMail(mailOptions);
        cache.set('otp', otp);
        res.status(200).json({ message: 'OTP sent to email. Proceed to verify'});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.verifyOTP = async(req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return;

    const otp = req.body.otp;

    try {
        let storedOTP = cache.get('otp');

        if (!storedOTP || storedOTP !== otp) {
            const error = new Error('Error occured in validating OTP');
            error.statusCode = 400;
            throw error;
        }

        cache.del('otp');
        await User.save(userDetails);
        userDetails = {};
        res.status(200).json({ message: 'Verification Complete' });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { createErrors } = require('../controllers/error');
const { User, Division, Section } = require('../util/database');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

function numericOTP (length) {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits.charAt(randomIndex);
    }

    return otp;
}

exports.signup = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const section_id = req.body.section_id;
        const username = req.body.username;
        const password = req.body.password;

        const isEmailExisting = await User.findOne({ where: { email } });
        const isUsernameExisting = await User.findOne({ where: { username } });

        if (isEmailExisting || isUsernameExisting) {
            return next(createErrors.conflict('A user with this email or username already exists.'));
        }

        const isValid = await Section.findOne({ where: { id: section_id } });

        if (!isValid) {
            return next(createErrors.notFound("A section with this id doesn't exist."));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const userDetails = { firstname, lastname, email, section_id, username, password: hashedPassword };

        await User.create(userDetails);
        res.status(201).json({ code: 201, message: 'User registered successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during the signup', err));
    }
}

exports.login = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const username = req.body.username;
        const password = req.body.password;

        const existingUser = await User.findOne({ where: { username } });

        if (!existingUser) {
            return next(createErrors.notFound("Account with this username doesn't exist."));
        }

        const storedUser = existingUser.dataValues;
        const isEqual = await bcrypt.compare(password, storedUser.password);

        if (!isEqual) {
            return next(createErrors.badRequest('Password is incorrect'));
        }

        const token = jwt.sign({
            id: storedUser.id,
            firstname: storedUser.firstname,
            lastname: storedUser.lastname,
            email: storedUser.email,
            section_id: storedUser.section_id,
            username: storedUser.username
        }, 'secretfortoken', { expiresIn: '1d' });

        res.status(201).json({ code: 201, message: token });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during login.', err));
    }
}

exports.recover = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const email = req.query.email;

        const isExisting = await User.findOne({ where: { email } });

        if (!isExisting) {
            return next(createErrors.notFound('An account with this email not found'));
        }

        const userDetails = isExisting.dataValues;

        const otp = numericOTP(6);

        const mailOptions = {
            from: process.env.EMAIL,
            to: userDetails.email,
            subject: 'Your One-Time Password (OTP) for Account Recovery',
            text: `Hello ${userDetails.firstname}! Your OTP is: ${otp}`
        }

        await transporter.sendMail(mailOptions);
        res.status(200).json({ code: 200, message: `An OTP was sent to ${userDetails.email}` });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong in recovering your account.', err));
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const email = req.body.email;
        const password = req.body.password;
        
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.update({ password: hashedPassword },
            { where: { email } }
        );
        res.status(201).json({ code: 201, message: 'Changed password successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong in changing your password.', err));
    }
}

exports.getAllDivisions = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const divisions = await Division.findAll();

        if (!divisions) {
            return next(createErrors.notFound('No existing divisions.'));
        }

        res.status(200).json(divisions);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of divisions.', err));
    }
}

exports.addDivision = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const division = req.query.division;

        await Division.create({ name: division });
        res.status(201).json({ code: 201, message: 'Division created successfully' })
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong in creating new division', err));
    }
}

exports.addSection = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if(!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed:', error.array));
        }

        const id = req.query.divId;
        
        const name = req.body.section_name;

        await Section.create({ name: name, division_id: id });
        res.status(201).json({ code: 201, message: 'Section created successfully' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong in creating new section', err));
    }
}

exports.getSectionByDiv = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const id = req.query.divId;

        const sections = await Section.findAll({ where: { division_id: id } }); 

        if (!sections) {
            return next(createErrors.notFound("Sections under this division doesn't exist."));
        }

        res.status(200).json(sections);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of sections'));
    }
}
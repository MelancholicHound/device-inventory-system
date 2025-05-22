const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { createErrors } = require('./error');
const { User, Division, Section, Batch, PurchaseRequestDTO } = require('../util/database.user');

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

        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const password = req.body.password;

        const isEmailExisting = await User.findOne({ where: { email } });

        if (isEmailExisting) {
            return next(createErrors.conflict('A user with this email already exists.'));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const userDetails = { first_name, last_name, email, password: hashedPassword };

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

        const email = req.body.email;
        const password = req.body.password;

        const existingUser = await User.findOne({ where: { email } });

        if (!existingUser) {
            return next(createErrors.notFound("Account with this email doesn't exist."));
        }

        const storedUser = existingUser.dataValues;
        const isEqual = await bcrypt.compare(password, storedUser.password);

        if (!isEqual) {
            return next(createErrors.badRequest('Password is incorrect.'));
        }

        const token = jwt.sign({
            id: storedUser.id,
            first_name: storedUser.first_name,
            last_name: storedUser.last_name,
            email: storedUser.email
        }, 'secretfortoken', { expiresIn: '9h' });

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
            return next(createErrors.notFound('An account with this email not found.'));
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
        next(createErrors.internalServerError('Something went wrong during fetching of sections.', err));
    }
}

exports.getAllBatches = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const batches = await Batch.findAll();

        res.status(200).json(batches);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetched of batches.', err));
    }
}

exports.saveBatch = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        const {
            valid_until,
            date_delivered,
            date_tested,
            supplier_id,
            service_center,
            purchaseRequestDTO
        } = req.body;
        
        const { number, file } = purchaseRequestDTO;
        const batchData = { valid_until, date_delivered, date_tested, supplier_id, service_center };

        const year = new Date().getFullYear().toString();

        const pr = await PurchaseRequestDTO.create({ number, file });
        const existingBatches = await Batch.findAll({
            where: {
                batch_id: {
                    [Op.like]: `${year}-%`
                }
            },
            attributes: ['batch_id'],
            raw: true
        });

        const usedNumbers = existingBatches
            .map(b => parseInt(b.batch_id.split('-')[1]))
            .filter(n => !isNaN(n));
        
        let newNumber = 1;

        while (usedNumbers.includes(newNumber)) {
            newNumber++;
        }

        const batchId = `${year}-${String(newNumber).padStart(3, '0')}`;

        const batch = await Batch.create({
            batch_id: batchId,
            prDTO_id: pr.id,
            created_by: req.user.id,
            ...batchData
        });

        localStorage.setItem('batch', JSON.stringify(batch));
        
        req.status(201).json({ code: 201, message: batch });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during saving of batch.', err));
    }
}
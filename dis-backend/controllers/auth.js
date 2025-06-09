const { validationResult } = require('express-validator');
const { Op, where } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User, Division, Section, Batch, PurchaseRequestDTO, Supplier, sequelize } = require('../models/index');

const { createErrors } = require('./error');

require('dotenv').config();

//User Async Functions
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

        res.status(201).send(token);
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

        if (isExisting.length === 0) {
            return next(createErrors.notFound('An account with this email not found.'));
        }
      
        res.status(201).json({ code: 200, message: `Email found.` });
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
      
        const password = req.body.password;
        
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.update({ password: hashedPassword },
            { where: { id: req.user.id } }
        );

        res.status(201).json({ code: 201, message: 'Changed password successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong in changing your password.', err));
    }
}

//Location Requests
exports.getAllDivisions = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        res.status(200).json(await Division.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of divisions.', err));
    }
}

exports.getDivisionById = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const id = req.query.id;

        res.status(200).json(await Division.findOne({ where: { id } }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of division.', err));
    }
}

exports.getSectionsByDivId = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const id = req.query.id;

        res.status(200).json(await Section.findAll({ where: { div_id: id } }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of sections.', err));
    }
}

//Supplier Async Function
exports.getAllSuppliers = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        res.status(200).json(await Supplier.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of suppliers.', err));
    }
}

exports.getSupplierById = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const id = req.query.id;

        res.status(200).json(await Supplier.findOne({ where: { id } }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of specific supplier.', err));
    }
}

exports.postSupplier = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const { name, contact_number, email, location, cp_name, cp_contact_number } = req.body;

        const isSupplierNumberExisting = await Supplier.findOne({ where: { contact_number } });
        const isContactPersonExisting = await Supplier.findOne({ where: { cp_name } });
        const isContactPersonNumberExisting = await Supplier.findOne({ where: { cp_contact_number } });

        if (isSupplierNumberExisting && isContactPersonNumberExisting) {
            return next(createErrors.conflict('This phone number already exists.'));
        }

        if (isContactPersonExisting) {
            return next(createErrors.conflict('This contact person already exists in one of the suppliers.'));
        }

        const supplierDetails = { name, contact_number, email, location, cp_name, cp_contact_number };

        await Supplier.create(supplierDetails);

        res.status(201).json({ code: 201, message: "Supplier saved." });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during saving of supplier.', err));
    }
}

exports.editSupplier = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const id = req.query.id;
        const { name, contact_number, email, location, cp_name, cp_contact_number } = req.body;

        const isExisting = await Supplier.findOne({ where: { id } });

        if (!isExisting) {
            return next(createErrors.notFound("Supplier with this id doesn't exist."));
        }

        const userData = { name, contact_number, email, location, cp_name, cp_contact_number };

        await Supplier.update(userData, { where: { id } });

        res.status(201).json({ code: 201, message: `Supplier updated successfully` });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on editing supplier.', err));
    }
}

exports.deleteSupplier = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const id = req.query.id;
        
        const isExisting = await Supplier.findOne({ where: { id } });

        if (!isExisting) {
            return next(createErrors.notFound(`A supplier with ${id} id doesn't exist.`));
        }

        await Supplier.destroy({ where : { id } });

        res.status(201).json({ code: 201, message: 'Supplier deleted successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during deleting supplier.'));
    }
}

//Batch Async Functions
exports.getAllBatches = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        res.status(200).json(await Batch.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetched of batches.', err));
    }
}

exports.getBatchById = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        const id = req.query.id;

        res.status(200).json(await Batch.findOne({ where: { id } }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching os specific batch.', err));
    }
}

exports.postBatch = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        const { valid_until, date_delivered, date_tested, supplier_id, service_center, purchaseRequestDTO } = req.body;
        const { number, file } = purchaseRequestDTO;

        const isPrExisting = await PurchaseRequestDTO.findOne({ where: { number } });

        if (isPrExisting) {
            return next(createErrors.badRequest('Purchase request number already exists in a batch'));
        }

        const year = new Date().getFullYear().toString();
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

        const pr = await PurchaseRequestDTO.create(purchaseRequestDTO);

        if (!pr) {
            return next(createErrors.unprocessableEntity('Something went wrong during saving of purchase request'));
        }

        const batch = await Batch.create({
            batch_id: batchId,
            prDTO_id: pr.id,
            created_by: req.user.id,
            valid_until, date_delivered, date_tested,
            supplier_id, service_center
        });

        res.status(201).json(batch);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during saving of batch.', err));
    }
}

exports.editBatch = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        const id = req.query.id;
        const { valid_until, date_delivered, date_tested, supplier_id, service_center, prDTO_id } = req.body;

        const isBatchExisting = await Batch.findOne({ where: { id } });

        if (!isBatchExisting) {
            return next(createErrors.notFound("Batch with this id doesn't exist."));
        }
        
        const batchData = { valid_until, date_delivered, date_tested, supplier_id, service_center, prDTO_id };

        await Batch.update(batchData, { where: { id } });

        res.status(201).json({ code: 201, message: 'Batch updated successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on editing batch.', err));
    }
}

exports.deleteBatch = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        const id = req.query.id;

        const isExisting = await Batch.findOne({ where: { id } });

        if (!isExisting) {
            return next(createErrors.notFound("A batch with this id doesn't exist."));
        }

        await Batch.destroy({ where: { id } });

        res.status(201).json({ code: 201, message: 'Batch deleted successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on deleting batch.', err));
    }
}
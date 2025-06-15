const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User, Division, Section, Batch, PurchaseRequestDTO, Supplier } = require('../models/index');

const { ProcessorAIO, AIO, RAMAIO, StorageAIO, ConnectionsAIO, PeripheralsAIO } = require('../models/index');
const { ProcessorComputer, MotherboardComputer, Computer, RAMComputer, StorageComputer, ConnectionsComputer, PeripheralsComputer } = require('../models/index');
const { ProcessorLaptop, Laptop, RAMLaptop, StorageLaptop, ConnectionsLaptop, PeripheralsLaptop } = require('../models/index');
const { Printer } = require('../models/index');
const { Router } = require('../models/index');
const { Scanner } = require('../models/index');
const { ChipsetTablet, Tablet, PeripheralsTablet, ConnectionsTablet } = require('../models/index');
const { UPS, BrandSeriesProcessor } = require('../models/index');

const { CapacityGPU, CapacityRAM, CapacityStorage } = require('../models/index');
const { PrinterType, ScannerType, StorageType, NetworkSpeed, AntennaCount, Connection, Peripheral, SoftwareOS, SoftwareProductivity, SoftwareSecurity } = require('../models/index');
const { PartChipset, PartGPU, PartMotherboard, PartProcessor, PartRAM, PartStorage } = require('../models/index');
const { BrandAIO, BrandLaptop, BrandPrinter, BrandRouter, BrandScanner, BrandTablet, BrandUPS, BrandMotherboard, BrandProcessor, BrandChipset } = require('../models/index');
const { AuditRAM, AuditGPU, AuditStorage, AuditMotherboard, AuditProcessor, AuditChipset } = require('../models/index');
const { generateChipsetReport, generateGPUReport, generateMotherboardReport, generateProcessorReport,generateRAMReport, generateStorageReport } = require('../util/common');

const { createErrors } = require('./error');

require('dotenv').config();

//User Middleware Functions
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
        if (!isExisting) {
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

//Location Middleware Functions
exports.getAllDivisions = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await Division.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of divisions.', err));
    }
}

exports.getSectionsByDivId = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        res.status(200).json(await Section.findAll({ where: { div_id: id } }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of sections.', err));
    }
}

//Supplier Middleware Function
exports.getAllSuppliers = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await Supplier.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetching of suppliers.', err));
    }
}

exports.getByIdSupplier= async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        res.status(200).json(await Supplier.findByPk(id));
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

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
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

exports.patchByIdSupplier = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const { name, contact_number, email, location, cp_name, cp_contact_number } = req.body;

        const isExisting = await Supplier.findByPk(id);
        if (!isExisting) {
            return next(createErrors.notFound("This supplier doesn't exist."));
        }

        const userData = { name, contact_number, email, location, cp_name, cp_contact_number };

        await Supplier.update(userData, { where: { id } });

        res.status(201).json({ code: 201, message: `Supplier updated successfully` });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on editing supplier.', err));
    }
}

exports.deleteByIdSupplier = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        
        const isExisting = await Supplier.findByPk(id);
        if (!isExisting) {
            return next(createErrors.notFound(`This supplier doesn't exist.`));
        }

        await Supplier.destroy({ where : { id } });

        res.status(201).json({ code: 201, message: 'Supplier deleted successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during deleting supplier.'));
    }
}

//Batch Middleware Functions
exports.getAllBatches = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await Batch.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong during fetched of batches.', err));
    }
}

exports.getByIdBatch = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        res.status(200).json(await Batch.findByPk(id));
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

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
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

exports.patchByIdBatch = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const { valid_until, date_delivered, date_tested, supplier_id, service_center, prDTO_id } = req.body;

        const isBatchExisting = await Batch.findByPk(id);
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

exports.deleteByIdBatch = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        const isExisting = await Batch.findByPk(id);
        if (!isExisting) {
            return next(createErrors.notFound("A batch with this id doesn't exist."));
        }

        await Batch.destroy({ where: { id } });

        res.status(201).json({ code: 201, message: 'Batch deleted successfully.' });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on deleting batch.', err));
    }
}

//Brands Middleware Functions
exports.postBrandAIO = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandAIO.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This AIO brand already exists.'));
        }

        res.status(200).json(await BrandAIO.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving AIO brand.', err)); 
    }
}

exports.postBrandLaptop = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandLaptop.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This laptop brand already exists.'));
        }

        res.status(200).json(await BrandLaptop.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving laptop brand.', err)); 
    }
}

exports.postBrandPrinter = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandPrinter.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This printer brand already exists.'));
        }

        res.status(200).json(await BrandPrinter.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving printer brand.', err)); 
    }
}

exports.postBrandRouter = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandRouter.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This router brand already exists.'));
        }

        res.status(200).json(await BrandRouter.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving router brand.', err)); 
    }
}

exports.postBrandScanner = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandScanner.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This scanner brand already exists.'));
        }

        res.status(200).json(await BrandScanner.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving scanner brand.', err)); 
    }
}

exports.postBrandTablet = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandTablet.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This scanner brand already exists.'));
        }

        res.status(200).json(await BrandTablet.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.postBrandUPS = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandUPS.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This UPS brand already exists.'));
        }

        res.status(200).json(await BrandUPS.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving UPS brand.', err)); 
    }
}

exports.postBrandMotherboard = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandMotherboard.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This motherboard brand already exists.'));
        }

        res.status(200).json(await BrandMotherboard.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.postBrandProcessor = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandProcessor.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This processor brand already exists.'));
        }

        res.status(200).json(await BrandProcessor.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.postBrandChipset = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await BrandChipset.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This chipset brand already exists.'));
        }

        res.status(200).json(await BrandChipset.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.getAllAIOBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandAIO.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all AIO brands.', err));
    }
}

exports.getAllLaptopBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandLaptop.findAll());
    } catch (err) {
       next(createErrors.internalServerError('Something went wrong on fetching all laptop brands.', err)); 
    }
}

exports.getAllPrinterBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandPrinter.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all printer brands.', err)); 
    }
}

exports.getAllRouterBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandRouter.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all router brands.', err)); 
    }
}

exports.getAllScannerBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandScanner.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all scanner brands.', err)); 
    }
}

exports.getAllTabletBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandTablet.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all tablet brands.', err)); 
    }
}

exports.getAllUPSBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandUPS.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all UPS brands.', err)); 
    }
}

exports.getAllMotherboardBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandMotherboard.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all motherboard brands.', err)); 
    }
}

exports.getAllProcessorBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandProcessor.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all motherboard brands.', err)); 
    }
}

exports.getAllChipsetBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await BrandChipset.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all chipset brands.', err)); 
    }
}

//Miscellaneous Middleware Functions
exports.postPrinterType = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const type = req.query.type;

        const isExisting = await PrinterType.findOne({ where: { type } });
        if (isExisting) {
            return next(createErrors.conflict('This printer type already exists'));
        }

        res.status(200).json(await PrinterType.create({ type }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving printer type.', err));
    }
}

exports.postScannerType = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const type = req.query.type;

        const isExisting = await ScannerType.findOne({ where: { type } });
        if (isExisting) {
            return next(createErrors.conflict('This scanner type already exists'));
        }

        res.status(200).json(await ScannerType.create({ type }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving scanner type.', err));
    }
}

exports.postNetworkSpeed = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const speed_by_mbps = req.query.speed;

        const isExisting = await NetworkSpeed.findOne({ where: { speed_by_mbps } });
        if (isExisting) {
            return next(createErrors.conflict('This network speed already exists.'));
        }

        res.status(200).json(await NetworkSpeed.create({ speed_by_mbps }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving network speed.', err));
    }
}

exports.postAntennaCount = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const antenna_count = req.query.count;

        const isExisting = await AntennaCount.findOne({ where: { antenna_count } });
        if (isExisting) {
            return next(createErrors.conflict('This antenna count already exists.'));
        }

        res.status(200).json(await AntennaCount.create({ antenna_count }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving antenna count.', err));
    }
}

exports.getAllPrinterTypes = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await PrinterType.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllScannerTypes = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await ScannerType.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all scanner type.', err));
    }
}

exports.getAllStorageTypes = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await StorageType.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllStorageTypes = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await StorageType.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllNetworkSpeeds = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await NetworkSpeed.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllAntennaCounts = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await AntennaCount.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

//Services Middleware Functions
exports.postConnection = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await Connection.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This connection already exists.'));
        }

        res.status(200).json(await Connection.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving connection.', err));
    }
}

exports.postPeripheral = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;
        
        const isExisting = await Peripheral.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This peripheral already exists.'));
        }

        res.status(200).json(await Peripheral.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving peripheral.', err));
    }
}

exports.postSoftwareOS = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await SoftwareOS.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This operating system already exists.'));
        }

        res.status(200).json(await SoftwareOS.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving operating system.', err));
    }
}

exports.postSoftwareProductivityTool = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;
        
        const isExisting = await SoftwareProductivity.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This productivity tool already exists.'));
        }

        res.status(200).json(await SoftwareProductivity.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving productivity tool.', err));
    }
}

exports.postSoftwareSecurity = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const name = req.query.name;

        const isExisting = await SoftwareSecurity.findOne({ where: { name } });
        if (isExisting) {
            return next(createErrors.conflict('This security tool already exists.'));
        }

        res.status(200).json(await SoftwareSecurity.create({ name }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving security.', err));
    }
}

exports.getAllConnections = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await Connection.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all connections.', err));
    }
}

exports.getAllPeripherals = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await Peripheral.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all peripherals.', err));
    }
}

exports.getAllSoftwareOS = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await SoftwareOS.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all operating systems.', err));
    }
}

exports.getAllSoftwareProductivity = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await SoftwareProductivity.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all productivity tools.', err));
    }
}

exports.getAllSoftwareSecurity = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await SoftwareSecurity.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all securities.', err));
    }
}

//Capacities Middleware Functions
exports.getAllRAM = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await CapacityRAM.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all RAM capacities.', err));
    }
}

exports.getAllStorage = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await CapacityStorage.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all storage capacities.', err));
    }
}

exports.getAllGPU = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await CapacityGPU.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all GPU capacities.', err));
    }
}

exports.postRAM = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const capacity = req.query.capacity;

        const isExisting = await CapacityRAM.findOne({ where: { capacity } });
        if (isExisting) {
            return next(createErrors.conflict('A RAM with this capacity already exists.'));
        }

        res.status(200).json(await CapacityRAM.create({ capacity }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving RAM.', err));
    }
}

exports.postStorage = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const capacity = req.query.capacity;

        const isExisting = await CapacityStorage.findOne({ where: { capacity } });
        if (isExisting) {
            return next(createErrors.conflict('A storage with this capacity already exists.'));
        }

        res.status(200).json(await CapacityStorage.create({ capacity }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving storage.', err));
    }
}

exports.postGPU = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const capacity = req.query.capacity;

        const isExisting = await CapacityGPU.findOne({ where: { capacity } });
        if (isExisting) {
            return next(createErrors.conflict('A GPU with this capacity already exists.'));
        }

        res.status(200).json(await CapacityGPU.create({ capacity }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving GPU.', err));
    }
}

//Parts Middleware Functions 
exports.postPartRAM = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const ram_id = req.body.ram_id;

        const isExisting = await CapacityRAM.findByPk(ram_id);
        if (!isExisting) {
            return next(createErrors.notFound("This ram capacity doesn't exists."));
        }

        res.status(200).json(await PartRAM.create({ ram_id }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving RAM part.', err));
    }
}

exports.postPartGPU = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const gpu_id = req.body.gpu_id;

        const isExisting = await CapacityGPU.findByPk(gpu_id);
        if (!isExisting) {
            return next(createErrors.notFound("This GPU capacity doesnt' exists."));
        }

        res.status(200).json(await PartGPU.create({ gpu_id }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving GPU part.', err));
    }
}

exports.postPartStorage = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const { storage_id, type_id } = req.body;

        const isCapacityExisting = await CapacityStorage.findByPk(storage_id);
        const isTypeExisting = await StorageType.findByPk(type_id);

        if (!isCapacityExisting) {
            return next(createErrors.notFound("A capacity with this id doesn't exists."));
        }

        if (!isTypeExisting) {
            return next(createErrors.notFound("A capacity with this id doesn't exists."));
        }

        res.status(200).json(await PartStorage.create({ storage_id, type_id }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving storage part.', err));
    }
}

exports.postPartProcessor = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const { series_id, model } = req.body;

        const isExisting = await BrandSeriesProcessor.findByPk(series_id);
        if (!isExisting) {
            return next(createErrors.notFound("Series with this id doesn't exists."));
        }

        res.status(200).json(await PartProcessor.create({ series_id, model }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving processor part.', err));
    }
}

exports.postPartMotherboard = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const { brand_id, model } = req.body;

        const isExisting = await BrandMotherboard.findByPk(brand_id);
        if (!isExisting) {
            return next(createErrors.notFound("This brand doesn't exists."));
        }

        res.status(200).json(await PartMotherboard.create({ brand_id, model }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving motherboard part.', err));
    }
}

exports.postPartChipset = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const { brand_id, model } = req.body;

        const isExisting = await BrandChipset.findByPk(brand_id);
        if (!isExisting) {
            return next(createErrors.notFound("This chipset brand doesn't exists in the database."))
        }
        
        res.status(200).json(await PartChipset.create({ brand_id, model }));
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving chipset part.', err));
    }
}

exports.getAllPartRAM = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await PartRAM.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all RAM part.', err));
    }
}

exports.getAllPartGPU = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await PartGPU.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all GPU part.', err));
    }
}

exports.getAllPartStorage = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await PartStorage.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all storage part.', err));
    }
}

exports.getAllPartProcessor = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await PartProcessor.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all processor part.', err));
    }
}

exports.getAllPartMotherboard = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await PartMotherboard.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all motherboard part.', err));
    }
}

exports.getAllPartChipset = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        res.status(200).json(await PartChipset.findAll());
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all chipset part.', err));
    }
}

exports.getByIdPartRAM = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        const partRAM = await PartRAM.findByPk(id);

        if (!partRAM) {
            return next(createErrors.notFound("This RAM part doesn't exists."));
        }

        res.status(200).json(partRAM);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching specific RAM part.', err));
    }
}

exports.getByIdPartGPU = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        const partGPU = await PartGPU.findByPk(id);

        if (!partGPU) {
            return next(createErrors.notFound("This GPU part doesn't exists."));
        }

        res.status(200).json(partGPU);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching specific GPU part.', err));
    }
}

exports.getByIdPartStorage = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        const partStorage = await PartStorage.findByPk(id);

        if (!partStorage) {
            return next(createErrors.notFound("This storage part doesn't exists."));
        }

        res.status(200).json(partStorage);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching specific storage part.', err));
    }
}

exports.getByIdPartProcessor = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        const partProcessor = await PartProcessor.findByPk(id);

        if (!partProcessor) {
            return next(createErrors.notFound("This processor part doesn't exists."));
        }

        res.status(200).json(partProcessor);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching specific processor part.', err));
    }
}

exports.getByIdPartMotherboard = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        const partMotherboard = await PartMotherboard.findByPk(id);

        if (!partMotherboard) {
            return next(createErrors.notFound("This motherboard part doesn't exists."));
        }

        res.status(200).json(partMotherboard);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching specific motherboard part.', err));
    }
}

exports.getByIdPartChipset = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;

        const partChipset = await PartChipset.findByPk(id);

        if (!partChipset) {
            return next(createErrors.notFound("This chipset part doesn't exists."));
        }

        res.status(200).json(partChipset);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching specific chipset part.', err));
    }
}

exports.patchByIdPartRAM = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const capacity_id = req.body.capacity_id;

        const oldRAM = await PartRAM.findByPk(id);
        const capacity = await CapacityRAM.findByPk(capacity_id);

        
        if (!oldRAM) {
            return next(createErrors.notFound("This RAM doesn't exist."));
        }

        if (!capacity) {
            return next(createErrors.notFound("This RAM capacity doesn't exist."));
        }

        const [updated] = await PartRAM.update({ capacity_id }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('RAM part update failed.'));
        }
      
        const report = await generateRAMReport('UPDATE', oldRAM, capacity);

        await AuditRAM.create({
            part_id: parseInt(id, 10),
            old_capacity_id: oldRAM.capacity_id,
            new_capacity_id: capacity_id,
            action: 'UPDATE',
            report: report,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        res.status(201).json({ code: 201, message: `Part RAM ${id} update and audit logged.`, report: report });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on updating specific RAM part.', err));
    }
}

exports.patchByIdPartGPU = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const capacity_id = req.body.capacity_id;

        const oldGPU = await PartRAM.findByPk(id);
        const capacity = await CapacityGPU.findByPk(capacity_id);

        if (!oldGPU) {
            return next(createErrors.notFound("This GPU doesn't exist."));
        }

        if (!capacity) {
            return next(createErrors.notFound("This GPU capacity doesn't exist."));
        }

        const [updated] = await PartGPU.update({ capacity_id }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('GPU part update failed.'));
        }

        const report = await generateGPUReport('UPDATE', oldGPU, capacity);

        await AuditGPU.create({
            part_id: parseInt(id, 10),
            old_capacity_id: oldGPU.capacity_id,
            new_capacity_id: capacity_id,
            action: 'UPDATE',
            report: report,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        res.status(201).json({ code: 201, message: `Part GPU ${id} update and audit logged.`, report: report });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on updating specific GPU part.', err));
    }
}

exports.patchByIdPartStorage = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const { capacity_id, type_id } = req.body;

        const oldStorage = await PartStorage.findByPk(id);
        const capacity = await CapacityStorage.findByPk(capacity_id);
        const type = await StorageType.findByPk(type_id);

        if (!oldStorage) {
            return next(createErrors.notFound("This storage doesn't exist."))
        }

        if (!capacity) {
            return next(createErrors.notFound("A capacity with this id doesn't exists."));
        }

        if (!type) {
            return next(createErrors.notFound("A capacity with this id doesn't exists."));
        }

        const [updated] = await PartStorage.update({ capacity_id, type_id }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('Storage part update failed.'));
        }

        const report = await generateStorageReport('UPDATE', oldStorage, capacity);

        await AuditStorage.create({
            part_id: parseInt(id, 10),
            old_capacity_id: oldStorage.capacity_id,
            old_type_id: oldStorage.type_id,
            new_capacity_id: capacity_id,
            new_type_id: type_id,
            action: 'UPDATE',
            report: report,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        res.status(201).json({ code: 201, message: `Part storage ${id} updated and audit logged.`, report: report });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on updating specific storage part.', err));
    }
}

exports.patchByIdPartProcessor = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const { series_id, model } = req.body;

        const oldProcessor = await PartProcessor.findByPk(id);
        const processorSeries = await BrandSeriesProcessor.findByPk(series_id);

        if (!oldProcessor) {
            return next(createErrors.notFound("This processor doesn't exists."));
        }

        if (!processorSeries) {
            return next(createErrors.notFound("This processor series doesn't exists."));
        }

        const [updated] = await PartProcessor.update({ series_id, model }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('Processor part update failed.'))
        }

        const report = await generateProcessorReport('UPDATE', oldProcessor, { series_id, model });

        await AuditProcessor.create({
            part_id: parseInt(id, 10),
            old_series_id: oldProcessor.series_id,
            old_model: oldProcessor.model,
            new_series_id: series_id,
            new_model: model,
            action: 'UPDATE',
            report: report,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        res.status(201).json({ code: 201, message: `Part processor ${id} updated and audit logged.`, report: report });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on updating specific processor part.', err));
    }
}

exports.patchByIdPartMotherboard = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const { brand_id, model } = req.body;

        const oldMotherboard = await PartMotherboard.findByPk(id);
        const motherboardBrand = await BrandMotherboard.findByPk(brand_id);

        if (!oldMotherboard) {
            return next(createErrors.notFound("This motherboard doesn't exist."));
        }

        if (!motherboardBrand) {
            return next(createErrors.notFound("This brand doesn't exist."));
        }

        const [updated] = await PartMotherboard.update({ brand_id, model }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('Processor part update failed.'));
        }

        const report = await generateMotherboardReport('UPDATE', oldMotherboard, { brand_id, model });

        await PartMotherboard.create({
            part_id: parseInt(id, 10),
            old_brand_id: oldMotherboard.brand_id,
            old_model: oldMotherboard.model,
            new_brand_id: brand_id,
            new_model: model,
            action: 'UPDATE',
            report: report,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        res.status(201).json({ code: 201, message: `Part motherboard ${id} updated and audit logged.`, report: report });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on updating specific motherboard part.', err));
    }
}

exports.patchByIdPartChipset = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const id = req.params.id;
        const { brand_id, model } = req.body;

        const oldChipset = await PartChipset.findByPk(id);
        const chipsetBrand = await BrandChipset.findByPk(brand_id);

        if (!oldChipset) {
            return next(createErrors.notFound("This chipset doesn't exist."))
        }

        if (!chipsetBrand) {
            return next(createErrors.notFound("This chipset brand doesn't exist."))
        }

        const [updated] = await PartChipset.update({ brand_id, model }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('Chipset part update failed.'));
        }

        const report = await generateChipsetReport('UPDATE', oldChipset, { brand_id, model });

        await PartChipset.create({
            part_id: parseInt(id, 10),
            old_brand_id: oldChipset.brand_id,
            old_model: oldChipset.model,
            new_brand_id: brand_id,
            new_model: model,
            action: 'UPDATE',
            report: report,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        res.status(201).json({ code: 201, message: `Part chipset ${id} updated and audit logged`, report: report });
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on updating specific chipset part.', err));
    }
}

//AIO Middleware Functions
exports.postAIO = async (req, res, next) => {
    try {
        
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on saving AIO.', err));
    }
}

//Centralized Middleware Functions
exports.findAllDevices = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        if (!req.user) {
            return next(createErrors.unauthorized('Invalid or expired token'));
        }

        const [ aios, computers, laptops, printers, routers, scanners, tablets, ups ] = await Promise.all([
            AIO.findAll(), Computer.findAll(), Laptop.findAll(), Printer.findAll(), Router.findAll(), Scanner.findAll(), Tablet.findAll(), UPS.findAll()
        ]);

        const allDevices = [
            ...aios.map(device => ({ type: 'AIO', device })),
            ...computers.map(device => ({ type: 'Computer', device })),
            ...laptops.map(device => ({ type: 'Laptop', device })),
            ...printers.map(device => ({ type: 'Printer', device })),
            ...routers.map(device => ({ type: 'Router', device })),
            ...scanners.map(device => ({ type: 'Scanner', device })),
            ...tablets.map(device => ({ type: 'Tablet', device })),
            ...ups.map(device => ({ type: 'UPS', device }))
        ];

        allDevices.sort((a, b) => new Date(b.device.created_at) - new Date(a.device.created_at));

        res.status(200).json(allDevices);
    } catch (err) {
        next(createErrors.internalServerError('Something went wrong on fetching all devices.', err));
    }
}
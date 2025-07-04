const { validationResult } = require('express-validator');
const { Op, where } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User, Division, Section, Batch, PurchaseRequestDTO, Supplier, sequelize } = require('../models/index');

const { ProcessorAIO, AIO, RAMAIO, StorageAIO, ConnectionsAIO, PeripheralsAIO, CondemnedAIO } = require('../models/index');
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
const { generateChipsetReport, generateGPUReport, generateMotherboardReport, generateProcessorReport, generateRAMReport, generateStorageReport } = require('../util/common');

const { createErrors } = require('./error');
const { raw } = require('body-parser');
const { createReadStream } = require('fs');

require('dotenv').config();

async function setDeviceNumber(device) {
    const models = {
        AIO: { model: AIO, prefix: 'PJG-AIO', start: 1 },
        Computer: { model: Computer, prefix: 'PJG-COMP', start: 1 },
        Laptop: { model: Laptop, prefix: 'PJG-LAP', start: 1 },
        Tablet: { model: Tablet, prefix: 'PJG-TAB', start: 1 },
        Router: { model: Router, prefix: 'PJG-RT', start: 1 },
        Scanner: { model: Scanner, prefix: 'PJG-SCAN', start: 1 },
        Printer: { model: Printer, prefix: 'PJG-PRNT', start: 1 },
        UPS: { model: UPS, prefix: 'PJG-UPS', start: 1 }
    };

    const entry = models[device];
    if (!entry) return null;
    
    const existing = await entry.model.findAll({
        attributes: ['device_number'],
        raw: true
    });

    const usedNumbers = existing
    .map(d => {
        const parts = d.device_number?.split('-');
        const numberPart = parts?.[parts.length - 1];
        return parseInt(numberPart);
    })
    .filter(n => !isNaN(n));

    const next = usedNumbers.length === 0 ? entry.start : Math.max(...usedNumbers) + 1;

    return { next, prefix: entry.prefix };
}

function requestValidation(req, next) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        throw createErrors.unprocessableEntity('Validation error: ', error.array());
    }

    if (!req.user) {
        throw createErrors.unauthorized('Invalid or expired token');
    }
}


//User Middleware Functions
exports.signup = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            throw createErrors.unprocessableEntity('Validation error: ', error.array());
        }

        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const password = req.body.password;

        const isEmailExisting = await User.findOne({ where: { email } });
        if (isEmailExisting) {
            throw createErrors.conflict('A user with this email already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const userDetails = { first_name, last_name, email, password: hashedPassword };

        await User.create(userDetails);
        res.status(201).json({ code: 201, message: 'User registered successfully.' });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during the signup', err));
    }
}

exports.login = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            throw createErrors.unprocessableEntity('Validation error: ', error.array());
        }

        const email = req.body.email;
        const password = req.body.password;

        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            throw createErrors.notFound("Account with this email doesn't exist.");
        }

        const storedUser = existingUser.dataValues;

        const isEqual = await bcrypt.compare(password, storedUser.password);
        if (!isEqual) {
            throw createErrors.badRequest('Password is incorrect.');
        }

        const token = jwt.sign({ id: storedUser.id, date_log: new Date() }, 'secretfortoken', { expiresIn: '9h' });

        res.status(200).send(token);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during login.', err));
    }
}

exports.recover = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            throw createErrors.unprocessableEntity('Validation error: ', error.array());
        }

        const email = req.query.email;

        const isExisting = await User.findOne({ where: { email } });
        if (!isExisting) {
            throw createErrors.notFound('An account with this email not found.');
        }
      
        res.status(200).json({ code: 200, message: `Email found.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong in recovering your account.', err));
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            throw createErrors.unprocessableEntity('Validation error: ', error.array());
        }
      
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.update({ password: hashedPassword },
            { where: { id: req.user.id } }
        );

        res.status(201).json({ code: 201, message: 'Changed password successfully.' });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong in changing your password.', err));
    }
}

exports.getUserById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw createErrors.notFound('User not found');
        }

        res.status(200).json(user)
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Failed to retrieve user.', err));
    }
}

//Location Middleware Functions
exports.getAllDivisions = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Division.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching of divisions.', err));
    }
}

exports.getSectionsByDivId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const sections = await Section.findAll({ where: { div_id: id } });

        res.status(200).json(sections.map(ram => ram.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching of sections.', err));
    }
}

//Supplier Middleware Function
exports.getAllSuppliers = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Supplier.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching of suppliers.', err));
    }
}

exports.getByIdSupplier= async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        res.status(200).json(await Supplier.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching of specific supplier.', err));
    }
}

exports.postSupplier = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { name, contact_number, email, location, cp_name, cp_contact_number } = req.body;

        const isSupplierNumberExisting = await Supplier.findOne({ where: { contact_number } });
        const isContactPersonExisting = await Supplier.findOne({ where: { cp_name } });
        const isContactPersonNumberExisting = await Supplier.findOne({ where: { cp_contact_number } });

        if (isSupplierNumberExisting && isContactPersonNumberExisting) {
            throw createErrors.conflict('This phone number already exists.');
        }

        if (isContactPersonExisting) {
            throw createErrors.conflict('This contact person already exists in one of the suppliers.');
        }

        const supplierDetails = { name, contact_number, email, location, cp_name, cp_contact_number };

        await Supplier.create(supplierDetails);

        res.status(201).json({ code: 201, message: "Supplier saved." });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during saving of supplier.', err));
    }
}

exports.putByIdSupplier = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const { name, contact_number, email, location, cp_name, cp_contact_number } = req.body;

        const isExisting = await Supplier.findByPk(id);
        if (!isExisting) {
            throw createErrors.notFound("This supplier doesn't exist.");
        }

        const userData = { name, contact_number, email, location, cp_name, cp_contact_number };

        await Supplier.update(userData, { where: { id } });

        res.status(201).json({ code: 201, message: `Supplier updated successfully` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on editing supplier.', err));
    }
}

exports.deleteByIdSupplier = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        
        const isExisting = await Supplier.findByPk(id);
        if (!isExisting) {
            throw createErrors.notFound(`This supplier doesn't exist.`);
        }

        await Supplier.destroy({ where : { id } });

        res.status(200).json({ code: 200, message: 'Supplier deleted successfully.' });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during deleting supplier.'));
    }
}

//Batch Middleware Functions
exports.getAllBatches = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Batch.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetched of batches.', err));
    }
}

exports.getByIdBatch = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        res.status(200).json(await Batch.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching os specific batch.', err));
    }
}

exports.postBatch = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        requestValidation(req, next);

        const { valid_until, date_delivered, date_tested, supplier_id, service_center, purchaseRequestDTO } = req.body;
        const { number, file } = purchaseRequestDTO;

        const isPrExisting = await PurchaseRequestDTO.findOne({ where: { number }, transaction: t });
        if (isPrExisting) {
            await t.rollback();
            throw createErrors.badRequest('Purchase request number already exists in a batch');
        }

        const year = new Date().getFullYear().toString();
        const existingBatches = await Batch.findAll({
            where: {
                batch_id: {
                    [Op.like]: `${year}-%`
                }
            },
            attributes: ['batch_id'],
            raw: true,
            transaction: t
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
            await t.rollback();
            throw createErrors.unprocessableEntity('Something went wrong during saving of purchase request');
        }

        const batch = await Batch.create({
            batch_id: batchId,
            prDTO_id: pr.id,
            created_by: req.user.id,
            valid_until, date_delivered, date_tested,
            supplier_id, service_center
        }, { transation: t });

        await t.commit();
        res.status(201).json(batch);
    } catch (err) {
        console.log(err);
        await t.rollback();
        next(createErrors.internalServerError('Something went wrong during saving of batch.', err));
    }
}

exports.putByIdBatch = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const { valid_until, date_delivered, date_tested, supplier_id, service_center, prDTO_id } = req.body;

        const isBatchExisting = await Batch.findByPk(id);
        if (!isBatchExisting) {
            throw createErrors.notFound("Batch with this id doesn't exist.");
        }
        
        const batchData = { valid_until, date_delivered, date_tested, supplier_id, service_center, prDTO_id };

        await Batch.update(batchData, { where: { id } });

        res.status(201).json({ code: 201, message: 'Batch updated successfully.' });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on editing batch.', err));
    }
}

exports.deleteByIdBatch = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        const isExisting = await Batch.findByPk(id);
        if (!isExisting) {
            throw createErrors.notFound("A batch with this id doesn't exist.");
        }

        await Batch.destroy({ where: { id } });

        res.status(200).json({ code: 200, message: 'Batch deleted successfully.' });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting batch.', err));
    }
}

//Brands Middleware Functions
exports.postBrandAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandAIO.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This AIO brand already exists.');
        }

        res.status(200).json(await BrandAIO.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving AIO brand.', err)); 
    }
}

exports.postBrandLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandLaptop.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This laptop brand already exists.');
        }

        res.status(200).json(await BrandLaptop.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving laptop brand.', err)); 
    }
}

exports.postBrandPrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandPrinter.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This printer brand already exists.');
        }

        res.status(200).json(await BrandPrinter.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving printer brand.', err)); 
    }
}

exports.postBrandRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandRouter.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This router brand already exists.');
        }

        res.status(200).json(await BrandRouter.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving router brand.', err)); 
    }
}

exports.postBrandScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandScanner.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This scanner brand already exists.');
        }

        res.status(200).json(await BrandScanner.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving scanner brand.', err)); 
    }
}

exports.postBrandTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandTablet.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This scanner brand already exists.');
        }

        res.status(200).json(await BrandTablet.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.postBrandUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandUPS.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This UPS brand already exists.');
        }

        res.status(200).json(await BrandUPS.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving UPS brand.', err)); 
    }
}

exports.postBrandMotherboard = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandMotherboard.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This motherboard brand already exists.');
        }

        res.status(200).json(await BrandMotherboard.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.postBrandProcessor = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandProcessor.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This processor brand already exists.');
        }

        res.status(200).json(await BrandProcessor.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.postBrandProcessorSeries = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const name = req.query.name;

        const isExisting = await BrandSeriesProcessor.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This processor series already exists.');
        }
        
        res.status(200).json(await BrandSeriesProcessor.create({ name: name, brand_id: id }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving processor series.', err));  
    }
}

exports.postBrandChipset = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await BrandChipset.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This chipset brand already exists.');
        }

        res.status(200).json(await BrandChipset.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving tablet brand.', err)); 
    }
}

exports.getAllAIOBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandAIO.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all AIO brands.', err));
    }
}

exports.getAllLaptopBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandLaptop.findAll());
    } catch (err) {
       console.log(err);n
       ext(createErrors.internalServerError('Something went wrong on fetching all laptop brands.', err)); 
    }
}

exports.getAllPrinterBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandPrinter.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printer brands.', err)); 
    }
}

exports.getAllRouterBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandRouter.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all router brands.', err)); 
    }
}

exports.getAllScannerBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandScanner.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all scanner brands.', err)); 
    }
}

exports.getAllTabletBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandTablet.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all tablet brands.', err)); 
    }
}

exports.getAllUPSBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandUPS.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all UPS brands.', err)); 
    }
}

exports.getAllMotherboardBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandMotherboard.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all motherboard brands.', err)); 
    }
}

exports.getAllProcessorBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandProcessor.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all motherboard brands.', err)); 
    }
}

exports.getAllProcessorSeriesById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        res.status(200).json(await BrandSeriesProcessor.findAll({ where: { brand_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all processor series.'));
    }
}

exports.getAllChipsetBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandChipset.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all chipset brands.', err)); 
    }
}

//Miscellaneous Middleware Functions
exports.postPrinterType = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const type = req.query.type;

        const isExisting = await PrinterType.findOne({ where: { type } });
        if (isExisting) {
            throw createErrors.conflict('This printer type already exists');
        }

        res.status(200).json(await PrinterType.create({ type }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving printer type.', err));
    }
}

exports.postScannerType = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const type = req.query.type;

        const isExisting = await ScannerType.findOne({ where: { type } });
        if (isExisting) {
            throw createErrors.conflict('This scanner type already exists');
        }

        res.status(200).json(await ScannerType.create({ type }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving scanner type.', err));
    }
}

exports.postNetworkSpeed = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const speed_by_mbps = req.query.speed;

        const isExisting = await NetworkSpeed.findOne({ where: { speed_by_mbps } });
        if (isExisting) {
            throw createErrors.conflict('This network speed already exists.');
        }

        res.status(200).json(await NetworkSpeed.create({ speed_by_mbps }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving network speed.', err));
    }
}

exports.postAntennaCount = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const antenna_count = req.query.count;

        const isExisting = await AntennaCount.findOne({ where: { antenna_count } });
        if (isExisting) {
            throw createErrors.conflict('This antenna count already exists.');
        }

        res.status(200).json(await AntennaCount.create({ antenna_count }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving antenna count.', err));
    }
}

exports.getAllPrinterTypes = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await PrinterType.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllScannerTypes = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await ScannerType.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all scanner type.', err));
    }
}

exports.getAllStorageTypes = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await StorageType.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllStorageTypes = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await StorageType.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllNetworkSpeeds = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await NetworkSpeed.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

exports.getAllAntennaCounts = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AntennaCount.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printer type.', err));
    }
}

//Services Middleware Functions
exports.postConnection = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await Connection.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This connection already exists.');
        }

        res.status(200).json(await Connection.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving connection.', err));
    }
}

exports.postPeripheral = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;
        
        const isExisting = await Peripheral.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This peripheral already exists.');
        }

        res.status(200).json(await Peripheral.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving peripheral.', err));
    }
}

exports.postSoftwareOS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await SoftwareOS.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This operating system already exists.');
        }

        res.status(200).json(await SoftwareOS.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving operating system.', err));
    }
}

exports.postSoftwareProductivityTool = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;
        
        const isExisting = await SoftwareProductivity.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This productivity tool already exists.');
        }

        res.status(200).json(await SoftwareProductivity.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving productivity tool.', err));
    }
}

exports.postSoftwareSecurity = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const name = req.query.name;

        const isExisting = await SoftwareSecurity.findOne({ where: { name } });
        if (isExisting) {
            throw createErrors.conflict('This security tool already exists.');
        }

        res.status(200).json(await SoftwareSecurity.create({ name }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving security.', err));
    }
}

exports.getAllConnections = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Connection.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all connections.', err));
    }
}

exports.getAllPeripherals = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Peripheral.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all peripherals.', err));
    }
}

exports.getAllSoftwareOS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await SoftwareOS.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all operating systems.', err));
    }
}

exports.getAllSoftwareProductivity = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await SoftwareProductivity.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all productivity tools.', err));
    }
}

exports.getAllSoftwareSecurity = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await SoftwareSecurity.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all securities.', err));
    }
}

//Capacities Middleware Functions
exports.getAllRAM = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await CapacityRAM.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all RAM capacities.', err));
    }
}

exports.getAllStorage = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await CapacityStorage.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all storage capacities.', err));
    }
}

exports.getAllGPU = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await CapacityGPU.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all GPU capacities.', err));
    }
}

exports.postRAM = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const capacity = req.query.capacity;

        const isExisting = await CapacityRAM.findOne({ where: { capacity } });
        if (isExisting) {
            throw createErrors.conflict('A RAM with this capacity already exists.');
        }

        res.status(200).json(await CapacityRAM.create({ capacity }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving RAM.', err));
    }
}

exports.postStorage = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const capacity = req.query.capacity;

        const isExisting = await CapacityStorage.findOne({ where: { capacity } });
        if (isExisting) {
            throw createErrors.conflict('A storage with this capacity already exists.');
        }

        res.status(200).json(await CapacityStorage.create({ capacity }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving storage.', err));
    }
}

exports.postGPU = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const capacity = req.query.capacity;

        const isExisting = await CapacityGPU.findOne({ where: { capacity } });
        if (isExisting) {
            throw createErrors.conflict('A GPU with this capacity already exists.');
        }

        res.status(200).json(await CapacityGPU.create({ capacity }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving GPU.', err));
    }
}

//Parts Middleware Functions 
exports.postPartRAM = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const ram_id = req.body.ram_id;

        const isExisting = await CapacityRAM.findByPk(ram_id);
        if (!isExisting) {
            throw createErrors.notFound("This ram capacity doesn't exists.");
        }

        res.status(200).json(await PartRAM.create({ ram_id }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving RAM part.', err));
    }
}

exports.postPartGPU = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const gpu_id = req.body.gpu_id;

        const isExisting = await CapacityGPU.findByPk(gpu_id);
        if (!isExisting) {
            throw createErrors.notFound("This GPU capacity doesnt' exists.");
        }

        res.status(200).json(await PartGPU.create({ gpu_id }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving GPU part.', err));
    }
}

exports.postPartStorage = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { storage_id, type_id } = req.body;

        const isCapacityExisting = await CapacityStorage.findByPk(storage_id);
        const isTypeExisting = await StorageType.findByPk(type_id);

        if (!isCapacityExisting) {
            throw createErrors.notFound("A capacity with this id doesn't exists.");
        }

        if (!isTypeExisting) {
            throw createErrors.notFound("A capacity with this id doesn't exists.");
        }

        res.status(200).json(await PartStorage.create({ storage_id, type_id }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving storage part.', err));
    }
}

exports.postPartProcessor = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { series_id, model } = req.body;

        const isExisting = await BrandSeriesProcessor.findByPk(series_id);
        if (!isExisting) {
            throw createErrors.notFound("Series with this id doesn't exists.");
        }

        res.status(200).json(await PartProcessor.create({ series_id, model }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving processor part.', err));
    }
}

exports.postPartMotherboard = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { brand_id, model } = req.body;

        const isExisting = await BrandMotherboard.findByPk(brand_id);
        if (!isExisting) {
            throw createErrors.notFound("This brand doesn't exists.");
        }

        res.status(200).json(await PartMotherboard.create({ brand_id, model }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving motherboard part.', err));
    }
}

exports.postPartChipset = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { brand_id, model } = req.body;

        const isExisting = await BrandChipset.findByPk(brand_id);
        if (!isExisting) {
            throw createErrors.notFound("This chipset brand doesn't exists in the database.");
        }
        
        res.status(200).json(await PartChipset.create({ brand_id, model }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving chipset part.', err));
    }
}

exports.getAllPartRAM = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await PartRAM.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all RAM part.', err));
    }
}

exports.getAllPartGPU = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await PartGPU.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all GPU part.', err));
    }
}

exports.getAllPartStorage = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await PartStorage.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all storage part.', err));
    }
}

exports.getAllPartProcessor = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await PartProcessor.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all processor part.', err));
    }
}

exports.getAllPartMotherboard = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await PartMotherboard.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all motherboard part.', err));
    }
}

exports.getAllPartChipset = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await PartChipset.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all chipset part.', err));
    }
}

exports.getByIdPartRAM = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        const partRAM = await PartRAM.findByPk(id);

        if (!partRAM) {
            throw createErrors.notFound("This RAM part doesn't exists.");
        }

        res.status(200).json(partRAM);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific RAM part.', err));
    }
}

exports.getByIdPartGPU = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        const partGPU = await PartGPU.findByPk(id);

        if (!partGPU) {
            throw createErrors.notFound("This GPU part doesn't exists.");
        }

        res.status(200).json(partGPU);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific GPU part.', err));
    }
}

exports.getByIdPartStorage = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        const partStorage = await PartStorage.findByPk(id);

        if (!partStorage) {
            throw createErrors.notFound("This storage part doesn't exists.");
        }

        res.status(200).json(partStorage);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific storage part.', err));
    }
}

exports.getByIdPartProcessor = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        const partProcessor = await PartProcessor.findByPk(id);

        if (!partProcessor) {
            throw createErrors.notFound("This processor part doesn't exists.");
        }

        res.status(200).json(partProcessor);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific processor part.', err));
    }
}

exports.getByIdPartMotherboard = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        const partMotherboard = await PartMotherboard.findByPk(id);

        if (!partMotherboard) {
            throw createErrors.notFound("This motherboard part doesn't exists.");
        }

        res.status(200).json(partMotherboard);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific motherboard part.', err));
    }
}

exports.getByIdPartChipset = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;

        const partChipset = await PartChipset.findByPk(id);

        if (!partChipset) {
            throw createErrors.notFound("This chipset part doesn't exists.");
        }

        res.status(200).json(partChipset);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific chipset part.', err));
    }
}

exports.putByIdPartRAM = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const capacity_id = req.body.capacity_id;

        const oldRAM = await PartRAM.findByPk(id);
        const capacity = await CapacityRAM.findByPk(capacity_id);

        
        if (!oldRAM) {
            throw createErrors.notFound("This RAM doesn't exist.");
        }

        if (!capacity) {
            throw createErrors.notFound("This RAM capacity doesn't exist.");
        }

        const [updated] = await PartRAM.update({ capacity_id }, { where: { id } });

        if (updated === 0) {
            throw createErrors.internalServerError('RAM part update failed.');
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
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating specific RAM part.', err));
    }
}

exports.putByIdPartGPU = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const capacity_id = req.body.capacity_id;

        const oldGPU = await PartRAM.findByPk(id);
        const capacity = await CapacityGPU.findByPk(capacity_id);

        if (!oldGPU) {
            throw createErrors.notFound("This GPU doesn't exist.");
        }

        if (!capacity) {
            throw createErrors.notFound("This GPU capacity doesn't exist.");
        }

        const [updated] = await PartGPU.update({ capacity_id }, { where: { id } });

        if (updated === 0) {
            throw createErrors.internalServerError('GPU part update failed.');
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
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating specific GPU part.', err));
    }
}

exports.putByIdPartStorage = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const { capacity_id, type_id } = req.body;

        const oldStorage = await PartStorage.findByPk(id);
        const capacity = await CapacityStorage.findByPk(capacity_id);
        const type = await StorageType.findByPk(type_id);

        if (!oldStorage) {
            throw createErrors.notFound("This storage doesn't exist.");
        }

        if (!capacity) {
            throw createErrors.notFound("A capacity with this id doesn't exists.");
        }

        if (!type) {
            throw createErrors.notFound("A capacity with this id doesn't exists.");
        }

        const [updated] = await PartStorage.update({ capacity_id, type_id }, { where: { id } });

        if (updated === 0) {
            throw createErrors.internalServerError('Storage part update failed.');
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
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating specific storage part.', err));
    }
}

exports.putByIdPartProcessor = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const { series_id, model } = req.body;

        const oldProcessor = await PartProcessor.findByPk(id);
        const processorSeries = await BrandSeriesProcessor.findByPk(series_id);

        if (!oldProcessor) {
            throw createErrors.notFound("This processor doesn't exists.");
        }

        if (!processorSeries) {
            throw createErrors.notFound("This processor series doesn't exists.");
        }

        const [updated] = await PartProcessor.update({ series_id, model }, { where: { id } });

        if (updated === 0) {
            throw createErrors.internalServerError('Processor part update failed.');
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
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating specific processor part.', err));
    }
}

exports.putByIdPartMotherboard = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const { brand_id, model } = req.body;

        const oldMotherboard = await PartMotherboard.findByPk(id);
        const motherboardBrand = await BrandMotherboard.findByPk(brand_id);

        if (!oldMotherboard) {
            throw createErrors.notFound("This motherboard doesn't exist.");
        }

        if (!motherboardBrand) {
            throw createErrors.notFound("This brand doesn't exist.");
        }

        const [updated] = await PartMotherboard.update({ brand_id, model }, { where: { id } });

        if (updated === 0) {
            throw createErrors.internalServerError('Processor part update failed.');
        }

        const report = await generateMotherboardReport('UPDATE', oldMotherboard, { brand_id, model });

        await AuditMotherboard.create({
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
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating specific motherboard part.', err));
    }
}

exports.putByIdPartChipset = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const id = req.params.id;
        const { brand_id, model } = req.body;

        const oldChipset = await PartChipset.findByPk(id);
        const chipsetBrand = await BrandChipset.findByPk(brand_id);

        if (!oldChipset) {
            throw createErrors.notFound("This chipset doesn't exist.");
        }

        if (!chipsetBrand) {
            throw createErrors.notFound("This chipset brand doesn't exist.");
        }

        const [updated] = await PartChipset.update({ brand_id, model }, { where: { id } });

        if (updated === 0) {
            throw createErrors.internalServerError('Chipset part update failed.');
        }

        const report = await generateChipsetReport('UPDATE', oldChipset, { brand_id, model });

        await AuditChipset.create({
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
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating specific chipset part.', err));
    }
}

//AIO Middleware Functions
exports.postDeviceAIO = async (req, res, next) => {
    const t = await sequelize.transaction();
    
    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            throw createErrors.badRequest('Request must be an array of AIO devices.');
        }
        
        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('AIO');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number,
                brand_id, model, ups_id,
                processorDTO, connectionDTO, peripheralDTO,
                gpu_id, os_id, prod_id, security_id,
                ramDTO: ramModules,
                storageDTO: storageModules
            } = device;

            if (!batch_id || typeof batch_id !== 'number') {
                throw createErrors.badRequest('batch_id is required and must be a number.');
            }

            if (!Array.isArray(ramModules)) {
                throw createErrors.badRequest('ramDTO must be an array.');
            }

            if (!Array.isArray(storageModules)) {
                throw createErrors.badRequest('storageDTO must be an array.');
            }

            const isBatchExisting = await Batch.findByPk(batch_id, { transaction: t });
            if (!isBatchExisting) {
                await t.rollback();
                throw createErrors.notFound("This batch doesn't exist.");
            }

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;

            const gpuResponse = await PartGPU.create({ capacity_id: gpu_id });

            const aio = await AIO.create({
                batch_id, section_id,
                device_number: deviceNum,
                serial_number, brand_id,
                model, is_condemned: false,
                ups_id, gpu_id: gpuResponse.id,
                os_id, prod_id, security_id
            }, { transaction: t });
                
            const processor = await PartProcessor.create(processorDTO, { transaction: t });
            await ProcessorAIO.create({
                aio_id: aio.id,
                cpu_id: processor.id
            }, { transaction: t });

            await Promise.all(
                ramModules.map(async ({ capacity_id }) => {
                    const ram = await PartRAM.create({ capacity_id }, { transaction: t });
                    await RAMAIO.create({ aio_id: aio.id, ram_id: ram.id }, { transaction: t });
                })
            );

            await Promise.all(
                storageModules.map(async ({ capacity_id, type_id }) => {
                    const storage = await PartStorage.create({ capacity_id, type_id }, { transaction: t });
                    await StorageAIO.create({ aio_id: aio.id, storage_id: storage.id }, { transaction: t });
                })
            );

            await Promise.all(
                (connectionDTO || []).map(async (connection_id) => {
                    await ConnectionsAIO.create({ aio_id: aio.id, connection_id }, { transaction: t });
                })
            );

            await Promise.all(
                (peripheralDTO || []).map(async (peripheral_id) => {
                    await PeripheralsAIO.create({ aio_id: aio.id, peripheral_id }, { transaction: t });
                })
            );

            savedDevices.push({ id: aio.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} AIO device(s) saved successfully.`, devices: savedDevices })
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on saving AIO.', err));
    }
}

exports.getAllDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AIO.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all AIO.', err));
    }
}

exports.getAllCondemnedDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedAIO = await AIO.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedAIO.map(aio => aio.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned AIO.', err));
    }
}

exports.getDeviceAIOById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        
        const aio = await AIO.findByPk(id);
        if (!aio) {
            throw createErrors.notFound("This AIO doesn't exists.");
        }

        res.status(200).json(aio);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned AIO.', err));
    }
}

exports.condemnedDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason } = req.body;

        const aio = await AIO.findByPk(id);
        if (!aio) {
            throw createErrors.notFound("This AIO doesn't exist.");
        }

        await AIO.update({ is_condemned: true }, { where: { id } });
        await CondemnedAIO.create({ aio_id: aio.id, reason, condemned_at: new Date() });

        res.status(200).json({ code: 200, message: `${aio.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned AIO.', err));
    }
}

exports.putByIdDeviceAIO = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
        const {
            section_id, serial_number, ups_id,
            processorDTO, connectionDTO, peripheralDTO,
            gpu_id, os_id, prod_id, security_id,
            ramDTO: ramModules,
            storageDTO: storageModules
        } = req.body;

        if (!Array.isArray(ramModules)) {
            throw createErrors.badRequest('ramDTO must be an array.');
        }

        if (!Array.isArray(storageModules)) {
            throw createErrors.badRequest('storageDTO must be an array.');
        }
         
        const aio = await AIO.findByPk(id, { transaction: t });
        if (!aio) {
            throw createErrors.notFound("This AIO doesn't exists.")
        }

        const oldPartGPU = await PartGPU.findByPk(aio.gpu_id);
        const newPartGPU = await PartGPU.update({ capacity_id: gpu_id }, { where: { id: aio.gpu_id }, transaction: t });
        const gpuReport = await generateGPUReport('UPDATE', oldPartGPU, newPartGPU);

        await AuditGPU.create({
            part_id: aio.gpu_id,
            old_capacity_id: oldPartGPU.capacity_id,
            new_capacity_id: newPartGPU.id,
            action: 'UPDATE',
            report: gpuReport,
            updated_by: req.user.id,
            updated_at: new Date()
        }, { transaction: t });

        const aioProcessor = await ProcessorAIO.findOne({ where: { aio_id: id } }); 
        await PartProcessor.update(processorDTO, { where: { id: aioProcessor.cpu_id }, transation: t });

        const aioRAMs = await RAMAIO.findAll({ where: { aio_id: id }, transaction: t });
        if (aioRAMs.length !== ramModules.length) {
            throw createErrors.badRequest('Mismatch between RAM modules provided and associated RAM slots.');
        }

        await Promise.all(
            aioRAMs.map(async (ramAIO, index) => {
                const { capacity_id } = ramModules[index];

                const oldPartRAM = await PartRAM.findByPk(ramAIO.ram_id, { transaction: t });
                if (!oldPartRAM) {
                    throw createErrors.notFound(`PartRAM not found for ID ${ramAIO.ram_id}`);
                }

                if (oldPartRAM.capacity_id === capacity_id) return;

                const newPartRAM = await PartRAM.update(
                    { capacity_id }, 
                    { where: { id: ramAIO.ram_id }, transaction: t }
                );

                const ramReport = await generateRAMReport('UPDATE', oldPartRAM, newPartRAM);

                await AuditRAM.create({
                    part_id: ramAIO.ram_id,
                    old_capacity_id: oldPartRAM.capacity_id,
                    new_capacity_id: capacity_id,
                    action: 'UPDATE',
                    report: ramReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            })
        );

        const aioStorages = await StorageAIO.findAll({ where: { aio_id: id } });
        if (aioStorages.length !== storageModules.length) {
            throw createErrors.badRequest('Mismatch between storage modules provided and associated storage slots.');
        }

        await Promise.all(
            aioStorages.map(async (storageAIO, index) => {
                const { capacity_id, type_id } = storageModules[index];

                const oldPartStorage = await PartStorage.findByPk(storageAIO.storage_id, { transaction: t });
                if (!oldStorage) {
                    throw createErrors.notFound(`PartStorage not found for ID ${storageAIO.storage_id}`);
                }

                if (oldPartStorage.capacity_id === capacity_id || oldPartStorage.type_id === type_id) return;

                const newPartStorage = await PartStorage.update(
                    { capacity_id, type_id }, 
                    { where: { id: storageAIO.storage_id }, transaction: t }
                );
                const storageReport = await generateStorageReport('UPDATE', oldStorage, newStorage);

                await AuditStorage.create({
                    part_id: storageAIO.storage_id,
                    old_capacity_id: oldPartStorage.capacity_id,
                    old_type_id: oldPartStorage.type_id,
                    new_capacity_id: newPartStorage.capacity_id,
                    new_type_id: newPartStorage.type_id,
                    action: 'UPDATE',
                    report: storageReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            })
        );
         
        
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific AIO.', err));
    }
}
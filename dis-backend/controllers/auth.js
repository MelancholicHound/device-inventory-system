const { validationResult } = require('express-validator');
const { Op, where } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const { User, Division, Section, Batch, PurchaseRequestDTO, Supplier, sequelize } = require('../models/index');

const { ProcessorAIO, AIO, RAMAIO, StorageAIO, ConnectionsAIO, PeripheralsAIO, CondemnedAIO, AuditAIOConnection, AuditAIOLocation } = require('../models/index');
const { ProcessorComputer, MotherboardComputer, Computer, RAMComputer, StorageComputer, ConnectionsComputer, PeripheralsComputer, CondemnedComputer, AuditComputerConnection, AuditComputerLocation } = require('../models/index');
const { ProcessorLaptop, Laptop, RAMLaptop, StorageLaptop, ConnectionsLaptop, PeripheralsLaptop, CondemnedLaptop, AuditLaptopConnection, AuditLaptopLocation } = require('../models/index');
const { Printer, CondemnedPrinter, AuditPrinterLocation } = require('../models/index');
const { Router, CondemnedRouter, AuditRouterLocation } = require('../models/index');
const { Scanner, CondemnedScanner, AuditScannerLocation } = require('../models/index');
const { ChipsetTablet, Tablet, PeripheralsTablet, ConnectionsTablet, CondemnedTablet, AuditTabletConnection, AuditTabletLocation } = require('../models/index');
const { UPS, CondemnedUPS, AuditUPSLocation } = require('../models/index');

const { CapacityGPU, CapacityRAM, CapacityStorage } = require('../models/index');
const { PrinterType, ScannerType, StorageType, NetworkSpeed, AntennaCount, Connection, Peripheral, SoftwareOS, SoftwareProductivity, SoftwareSecurity } = require('../models/index');
const { PartChipset, PartGPU, PartMotherboard, PartProcessor, PartRAM, PartStorage } = require('../models/index');
const { BrandAIO, BrandLaptop, BrandPrinter, BrandRouter, BrandScanner, BrandTablet, BrandUPS, BrandMotherboard, BrandProcessor, BrandChipset, BrandSeriesProcessor } = require('../models/index');
const { AuditRAM, AuditGPU, AuditStorage, AuditMotherboard, AuditProcessor, AuditChipset } = require('../models/index');
const { generateChipsetReport, generateGPUReport, generateMotherboardReport, generateProcessorReport, generateRAMReport, generateStorageReport, generateSectionReport } = require('../util/common');

const { createErrors } = require('./error');

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
        return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
    }

    if (!req.user) {
        return next(createErrors.unauthorized('Invalid or expired token'));
    }
}


//User Middleware Functions
exports.signup = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
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
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during the signup', err));
    }
}

exports.login = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
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
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }

        const email = req.query.email;

        const isExisting = await User.findOne({ where: { email } });
        if (!isExisting) {
            return next(createErrors.notFound('An account with this email not found.'));
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
            return next(createErrors.unprocessableEntity('Validation error: ', error.array()));
        }
      
        const { email, password } = req.body;
        
        const isAccountExisting = await User.findOne({ where: { email } });
        if (!isAccountExisting) return next(createErrors.notFound("An account with this email doesn't exist."));

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.update({ password: hashedPassword },
            { where: { email } }
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
            return next(createErrors.notFound('User not found'));
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

exports.getDivisionById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Division.findOne({ where: { id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching of division by id.', err));
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

exports.getSectionById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Section.findOne({ where: { id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching of division by id.', err));
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

exports.getByIdSupplier = async (req, res, next) => {
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
            return next(createErrors.conflict('This phone number already exists.'));
        }

        if (isContactPersonExisting) {
            return next(createErrors.conflict('This contact person already exists in one of the suppliers.'));
        }

        const supplierDetails = { name, contact_number, email, location, cp_name, cp_contact_number, created_by: req.user.id };

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
            return next(createErrors.notFound("This supplier doesn't exist."));
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
            return next(createErrors.notFound(`This supplier doesn't exist.`));
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

        const batch = await Batch.findByPk(id, {
            include: [{ model: PurchaseRequestDTO, as: 'purchaseRequestDTO', attributes: ['number', 'file'] }]
        });

        res.status(200).json(batch);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong during fetching os specific batch.', err));
    }
}

exports.postBatch = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        requestValidation(req, next);

        const valid_until = req.body.valid_until || null;
        const date_delivered = req.body.date_delivered || null;
        const date_tested = req.body.date_tested || null;
        const supplier_id = req.body.supplier_id || null;
        const service_center = req.body.service_center || null;
        const number = req.body.number || null;
   
        const isPrExisting = await PurchaseRequestDTO.findOne({ where: { number }, transaction: t });
        if (isPrExisting) {
            await t.rollback();
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

        const supplier = await Supplier.findByPk(supplier_id);
        if (!supplier) {
            await t.rollback();
            return next(createErrors.notFound("This supplier doesn't exist."));
        }

        const pr = await PurchaseRequestDTO.create({
            number,
            file: req.file ? req.file.filename : null
        }, { transaction: t });

        if (!pr) {
            await t.rollback();
            return next(createErrors.unprocessableEntity('Something went wrong during saving of purchase request'));
        }

        const batch = await Batch.create({
            batch_id: batchId,
            prDTO_id: pr.id,
            created_by: req.user.id,
            valid_until, date_delivered, 
            date_tested: date_tested ? date_tested : null,
            supplier_id: parseInt(supplier_id, 10), service_center
        }, { transaction: t });

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
        const { valid_until, date_delivered, date_tested, supplier_id, service_center, purchaseRequestDTO } = req.body;

        const batch = await Batch.findByPk(id);
        if (!batch) {
            return next(createErrors.notFound("Batch with this id doesn't exist."));
        }

        const isSupplierExisting = await Supplier.findByPk(supplier_id);
        if (!isSupplierExisting) {
            return next(createErrors.notFound("Supplier with this id doesn't exist."));
        }

        await PurchaseRequestDTO.update(purchaseRequestDTO, { where: { id: batch.prDTO_id } });
        
        const batchData = { valid_until, date_delivered, date_tested, supplier_id, service_center };

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

        const batch = await Batch.findByPk(id);

        if (!batch) {
            return next(createErrors.notFound("A batch with this id doesn't exist."));
        }

        const deviceConfigs = [
            { model: AIO, children: ['processor', 'ram_modules', 'storage_dto', 'connections', 'peripherals'] },
            { model: Computer, children: ['processor', 'motherboard', 'ram_modules', 'storage_dto', 'connections', 'peripherals'] },
            { model: Laptop, children: ['processor', 'ram_modules', 'storage_dto', 'connections', 'peripherals'] },
            { model: Printer, children: [] },
            { model: Router, children: [] },
            { model: Scanner, children: [] },
            { model: Tablet, children: ['chipset', 'connections', 'peripherals'] },
            { model: UPS, children: [] },
        ];

        for (const { model, children } of deviceConfigs) {
            const devices = await model.findAll({
                where: { batch_id: id },
                include: children,
            });
           
            const deletePromises = devices.map(async (device) => {
            for (const childName of children) {
                const child = device[childName];
                if (child) {
                if (Array.isArray(child)) {
                    await Promise.all(child.map(c => c.destroy()));
                } else {
                    await child.destroy();
                }
                }
            }
            
            await device.destroy();
            });

            await Promise.all(deletePromises);
        }
        
        await Batch.destroy({ where: { id } });
        await PurchaseRequestDTO.destroy({ where: { id: batch.prDTO_id } });
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
            return next(createErrors.conflict('This AIO brand already exists.'));
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
            return next(createErrors.conflict('This laptop brand already exists.'));
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
            return next(createErrors.conflict('This printer brand already exists.'));
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
            return next(createErrors.conflict('This router brand already exists.'));
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
            return next(createErrors.conflict('This scanner brand already exists.'));
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
            return next(createErrors.conflict('This scanner brand already exists.'));
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
            return next(createErrors.conflict('This UPS brand already exists.'));
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
            return next(createErrors.conflict('This motherboard brand already exists.'));
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
            return next(createErrors.conflict('This processor brand already exists.'));
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
            return next(createErrors.conflict('This processor series already exists.'));
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
            return next(createErrors.conflict('This chipset brand already exists.'));
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

exports.getAIOBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandAIO.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific AIO brand.', err));
    }
}

exports.getAllLaptopBrands = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await BrandLaptop.findAll());
    } catch (err) {
       console.log(err);
       next(createErrors.internalServerError('Something went wrong on fetching all laptop brands.', err)); 
    }
}

exports.getLaptopBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandLaptop.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific laptop brand.', err));
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

exports.getPrinterBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandPrinter.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific printer brand.', err)); 
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

exports.getRouterBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandRouter.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific printer brand.', err)); 
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

exports.getScannerBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandScanner.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific scanner brand.', err)); 
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

exports.getTabletBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandTablet.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific tablet brand.', err)); 
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

exports.getUPSBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandUPS.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific UPS brand.', err)); 
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

exports.getMotherboardBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandMotherboard.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific motherboard brand.', err)); 
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

exports.getProcessorBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandProcessor.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific motherboard brand.', err)); 
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

exports.getChipsetBrandById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await BrandChipset.findByPk(id));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific motherboard brand.', err)); 
    }
}

//Miscellaneous Middleware Functions
exports.postPrinterType = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const type = req.query.type;

        const isExisting = await PrinterType.findOne({ where: { type } });
        if (isExisting) {
            return next(createErrors.conflict('This printer type already exists'));
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
            return next(createErrors.conflict('This scanner type already exists'));
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
            return next(createErrors.conflict('This network speed already exists.'));
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
            return next(createErrors.conflict('This antenna count already exists.'));
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
            return next(createErrors.conflict('This connection already exists.'));
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
            return next(createErrors.conflict('This peripheral already exists.'));
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
            return next(createErrors.conflict('This operating system already exists.'));
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
            return next(createErrors.conflict('This productivity tool already exists.'));
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
            return next(createErrors.conflict('This security tool already exists.'));
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
            return next(createErrors.conflict('A RAM with this capacity already exists.'));
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
            return next(createErrors.conflict('A storage with this capacity already exists.'));
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
            return next(createErrors.conflict('A GPU with this capacity already exists.'));
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
            return next(createErrors.notFound("This ram capacity doesn't exists."));
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
            return next(createErrors.notFound("This GPU capacity doesnt' exists."));
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
            return next(createErrors.notFound("A capacity with this id doesn't exists."));
        }

        if (!isTypeExisting) {
            return next(createErrors.notFound("A capacity with this id doesn't exists."));
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
            return next(createErrors.notFound("Series with this id doesn't exists."));
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
            return next(createErrors.notFound("This brand doesn't exists."));
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
            return next(createErrors.notFound("This chipset brand doesn't exists in the database."));
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
            return next(createErrors.notFound("This RAM part doesn't exists."));
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
            return next(createErrors.notFound("This GPU part doesn't exists."));
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
            return next(createErrors.notFound("This storage part doesn't exists."));
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
            return next(createErrors.notFound("This processor part doesn't exists."));
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
            return next(createErrors.notFound("This motherboard part doesn't exists."));
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
            return next(createErrors.notFound("This chipset part doesn't exists."));
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
            return next(createErrors.notFound("This storage doesn't exist."));
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
            return next(createErrors.notFound("This processor doesn't exists."));
        }

        if (!processorSeries) {
            return next(createErrors.notFound("This processor series doesn't exists."));
        }

        const [updated] = await PartProcessor.update({ series_id, model }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('Processor part update failed.'));
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
            return next(createErrors.notFound("This chipset doesn't exist."));
        }

        if (!chipsetBrand) {
            return next(createErrors.notFound("This chipset brand doesn't exist."));
        }

        const [updated] = await PartChipset.update({ brand_id, model }, { where: { id } });

        if (updated === 0) {
            return next(createErrors.internalServerError('Chipset part update failed.'));
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
            return next(createErrors.badRequest('Request must be an array of AIO devices.'));
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
                accountable_user, co_accountable_user,
                ramDTO: ramModules,
                storageDTO: storageModules
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is required and must be a number.'));

            if (!Array.isArray(ramModules)) return next(createErrors.badRequest('ramDTO must be an array.'));
            if (!Array.isArray(storageModules)) return next(createErrors.badRequest('storageDTO must be an array.'));

            const isBatchExisting = await Batch.findByPk(batch_id, { transaction: t });
            if (!isBatchExisting) {
                await t.rollback();
                return next(createErrors.notFound("This batch doesn't exist."));
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
                os_id, prod_id, security_id,
                accountable_user, co_accountable_user,
            }, { transaction: t });
                
            if (!processorDTO) return next(createErrors.badRequest("processorDTO must have a value"));
            if (typeof processorDTO !== 'object') return next(createErrors.badRequest('processorDTO must be an object'));

            const processor = await PartProcessor.create(processorDTO, { transaction: t });
            await ProcessorAIO.create({
                aio_id: aio.id,
                cpu_id: processor.id
            }, { transaction: t });

            for (const { capacity_id } of ramModules) {
                const ram = await PartRAM.create({ capacity_id }, { transaction: t });

                await RAMAIO.create({ aio_id: aio.id, ram_id: ram.id }, { transaction: t });
            }

            for (const { capacity_id, type_id } of storageModules) {
                const storage = await PartStorage.create({ capacity_id, type_id }, { transaction: t });

                await StorageAIO.create({ aio_id: aio.id, storage_id: storage.id }, { transaction: t });
            }

            for (const connection_id of connectionDTO) {
                await ConnectionsAIO.create({ aio_id: aio.id, connection_id }, { transaction: t });
            }
        
            for (const peripheral_id of peripheralDTO) {
                await PeripheralsAIO.create({ aio_id: aio.id, peripheral_id }, { transaction: t });
            }

            savedDevices.push({ id: aio.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} AIO device(s) saved successfully.`, devices: savedDevices });
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
        next(createErrors.internalServerError('Something went wrong on fetching all AIOs.', err));
    }
}

exports.getAllDeviceAIOByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AIO.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all AIOs by batch id.', err));
    }
}

exports.getAllCondemnedDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedAIO = await AIO.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedAIO.map(aio => aio.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned AIOs.', err));
    }
}

exports.getAllWorkingDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingAIO = await AIO.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingAIO.map(aio => aio.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all working AIOs.', err));
    }
}

exports.getDeviceAIOById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        
        const aio = await AIO.findByPk(id, {
            attributes: {
                exclude: ['gpu_id', 'created_at'] 
            },
            include: [
                {
                    model: ProcessorAIO,
                    as: 'processor',
                    include: [{
                        model: PartProcessor,
                        as: 'cpu',
                        include: [{ 
                            model: BrandSeriesProcessor,
                            as: 'series',
                            include: [{
                                model: BrandProcessor,
                                as: 'brand'
                            }] 
                        }]
                    }]
                },
                {
                    model: PartGPU,
                    as: 'gpu',
                    include: [{ 
                        model: CapacityGPU,
                        as: 'capacity'
                    }]
                },
                {
                    model: RAMAIO,
                    as: 'ram_modules',
                    include: [{ 
                        model: PartRAM, 
                        as: 'ram',
                        include: [{ 
                            model: CapacityRAM,
                            as: 'capacity'
                        }] 
                    }]
                },
                {
                    model: StorageAIO,
                    as: 'storage_dto',
                    include: [{ 
                        model: PartStorage,
                        as: 'storage',
                        include: [
                            { model: CapacityStorage, as: 'capacity' }, 
                            { model: StorageType, as: 'type' }
                        ] 
                    }]
                },
                {
                    model: ConnectionsAIO,
                    as: 'connections',
                    include: [{ 
                        model: Connection,
                        as: 'connection'
                    }]
                },
                {
                    model: PeripheralsAIO,
                    as: 'peripherals',
                    include: [{ 
                        model: Peripheral,
                        as: 'peripheral'
                    }]
                }
            ]
        });

        if (!aio) return next(createErrors.notFound("This AIO doesn't exists."));

        const json = aio.toJSON();

        const result = {
            id: json.id,
            batch_id: json.batch_id,
            section_id: json.section_id,
            serial_number: json.serial_number,
            brand_id: json.brand_id,
            model: json.model,
            ups_id: json.ups_id,
            processorDTO: {
                series_id: json.processor?.cpu?.series_id || null,
                model: json.processor?.cpu?.model || null
            },
            ramDTO: json.ram_modules.map(ram => ({
                capacity_id: ram.ram?.capacity_id || null
            })),
            storageDTO: json.storage_dto.map(storage => ({
                capacity_id: storage.storage?.capacity_id || null,
                type_id: storage.storage?.type_id || null
            })),
            connectionDTO: json.connections.map(conn => conn.connection_id),
            peripheralDTO: json.peripherals.map(periph => periph.peripheral_id),
            gpu_id: json.gpu_id,
            os_id: json.os_id,
            prod_id: json.prod_id,
            security_id: json.security_id,
            accountable_user: json.accountable_user, 
            co_accountable_user: json.co_accountable_user,
        };

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific AIO.', err));
    }
}

exports.condemnedDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const aio = await AIO.findByPk(id);
        if (!aio) return next(createErrors.notFound("This AIO doesn't exist."));

        await AIO.update({ is_condemned: true }, { where: { id } });
        await CondemnedAIO.create({ aio_id: aio.id, reason, condemned_by: req.user.id, condemned_at });
        await ConnectionsAIO.destroy({ where: { aio_id: id } });
        await PeripheralsAIO.destroy({ where: { aio_id: id } });

        res.status(200).json({ code: 200, message: `${aio.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of AIO.', err));
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
            accountable_user, co_accountable_user,
            ramDTO: ramModules,
            storageDTO: storageModules
        } = req.body;

        if (!Array.isArray(ramModules)) return next(createErrors.badRequest('ramDTO must be an array.'));
        if (!Array.isArray(storageModules)) return next(createErrors.badRequest('storageDTO must be an array.'));
        if (!Array.isArray(connectionDTO)) return next(createErrors.badRequest('connectionDTO must be an array'));
        if (!Array.isArray(peripheralDTO)) return next(createErrors.badRequest('peripheralDTO must be an array'));
         
        const aio = await AIO.findByPk(id, { transaction: t });
        if (!aio) return next(createErrors.notFound("This AIO doesn't exists."));

        const oldGPU = await PartGPU.findByPk(aio.gpu_id);

        await PartGPU.update({ capacity_id: gpu_id }, { where: { id: aio.gpu_id }, transaction: t });

        const newGPU = await PartGPU.findByPk(aio.gpu_id);

        const gpuReport = await generateGPUReport('UPDATE', oldGPU, newGPU);

        await AuditGPU.create({
            part_id: aio.gpu_id,
            old_capacity_id: oldGPU.capacity_id,
            new_capacity_id: gpu_id,
            action: 'UPDATE',
            report: gpuReport,
            updated_by: req.user.id,
            updated_at: new Date()
        }, { transaction: t });

        if (!processorDTO) return next(createErrors.badRequest("processorDTO must have a value"));
        if (typeof processorDTO !== 'object') return next(createErrors.badRequest('processorDTO must be an object'));

        const aioProcessor = await ProcessorAIO.findOne({ where: { aio_id: id }, transaction: t });
        if (!aioProcessor) return next(createErrors.notFound('ProcessorAIO not found.'));

        await PartProcessor.update(processorDTO, { where: { id: aioProcessor.cpu_id }, transation: t });

        const aioRAMs = await RAMAIO.findAll({ where: { aio_id: id }, transaction: t });
        if (aioRAMs.length !== ramModules.length) {
            return next(createErrors.badRequest('Mismatch between RAM modules provided and associated RAM slots.'));
        }

        for (let i = 0; i < aioRAMs.length; i++) {
            const ramAIO = aioRAMs[i];
            const { capacity_id } = ramModules[i];

            const oldRAM = await PartRAM.findByPk(ramAIO.ram_id);
            if (!oldRAM) return next(createErrors.notFound(`PartRAM not found for ID ${ramAIO.ram_id}`));

            if (oldRAM.capacity_id !== capacity_id) {
                await PartRAM.update({ capacity_id }, { where: { id: ramAIO.ram_id }, transaction: t });
                
                const newRAM = await PartRAM.findByPk(ramAIO.ram_id);
                const ramReport = await generateRAMReport('UPDATE', oldRAM, newRAM);

                await AuditRAM.create({
                    part_id: ramAIO.ram_id,
                    old_capacity_id: oldRAM.capacity_id,
                    new_capacity_id: capacity_id,
                    action: 'UPDATE',
                    report: ramReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            }
        }
        
        const aioStorages = await StorageAIO.findAll({ where: { aio_id: id }, transaction: t });
        if (aioStorages.length !== storageModules.length) {
            return next(createErrors.badRequest('Mismatch between storage modules provided and associated storage slots.'));
        }

        for (let i = 0; i < aioStorages.length; i++) {
            const storageAIO = aioStorages[i];
            const { capacity_id, type_id } = storageModules[i];

            const oldStorage = await PartStorage.findByPk(storageAIO.storage_id);
            if (!oldStorage) return next(createErrors.notFound(`Storage part not found for ID ${storageAIO.storage_id}.`));

            const needsUpdate = oldStorage.capacity_id !== capacity_id || oldStorage.type_id !== type_id;

            if (needsUpdate) {
                await PartStorage.update({ capacity_id, type_id }, { where: { id: storageAIO.storage_id }, transaction: t });
                
                const newStorage = await PartStorage.findByPk(storageAIO.storage_id);
                const storageReport = await generateStorageReport('UPDATE', oldStorage, newStorage);

                await AuditStorage.create({
                    part_id: storageAIO.storage_id,
                    old_capacity_id: oldStorage.capacity_id,
                    old_type_id: oldStorage.type_id,
                    new_capacity_id: capacity_id,
                    new_type_id: type_id,
                    action: 'UPDATE',
                    report: storageReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            }
        }
         
        const existingConns = await ConnectionsAIO.findAll({ 
            where: { aio_id: id },
            attributes: ['connection_id'],
            raw: true,
            transaction: t 
        });

        const existingConnIds = existingConns.map(c => c.connection_id);
        const newConnIds = connectionDTO;

        const toAdd = newConnIds.filter(id => !existingConnIds.includes(id));
        const toRemove = existingConnIds.filter(id => !newConnIds.includes(id));

        for (const connId of toRemove) {
            await ConnectionsAIO.destroy({ where: { aio_id: id, connection_id: connId }, transaction: t });

            await AuditAIOConnection.create({
                aio_id: id,
                connection_id: connId,
                action: 'REMOVE',
                changed_by: req.user.id,
                changed_at: new Date()
            }, { transaction: t });
        }

        for (const connId of toAdd) {
            await ConnectionsAIO.create({ aio_id: id, connection_id: connId }, { transaction: t });

            await AuditAIOConnection.create({
                aio_id: id,
                connection_id: connId,
                action: 'ADD',
                changed_by: req.user.id,
                changed_at: new Date()
            }, { transaction: t });
        }

        await PeripheralsAIO.destroy({ where: { aio_id: id }, transaction: t });

        await Promise.all(peripheralDTO.map(peripheral_id => PeripheralsAIO.create({ aio_id: id, peripheral_id }, { transaction: t })));
        
        if (aio.section_id !== section_id) {
            const locationReport = await generateSectionReport(aio.section_id, section_id);

            await AuditAIOLocation.create({
                aio_id: id,
                old_section_id: aio.section_id,
                new_section_id: section_id,
                report: locationReport,
                updated_by: req.user.id,
                updated_at: new Date()
            }, { transaction: t });
        }

        await AIO.update({
            section_id, serial_number, ups_id, 
            os_id, prod_id, security_id,
            accountable_user, co_accountable_user,
        }, { where: { id }, transaction: t });

        await t.commit();
        res.status(200).json({ code: 200, message: 'AIO device updated successfully.' });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific AIO.', err));
    }
}

exports.deleteByIdDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const aio = await AIO.findByPk(id, {
            include: ['processor', 'ram_modules', 'storage_dto', 'connections', 'peripherals']
        });

        if (aio.processor) await aio.processor.destroy();
        if (aio.ram_modules) await Promise.all(aio.ram_modules.map(r => r.destroy()));
        if (aio.storage_dto) await Promise.all(aio.storage_dto.map(s => s.destroy()));
        if (aio.connections) await Promise.all(aio.connections.map(c => c.destroy()));
        if (aio.peripherals) await Promise.all(aio.peripherals.map(p => p.destroy()));

        await aio.destroy();

        res.status(200).json({ code: 200, message: `${aio.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific AIO.', err));
    }
}

exports.getConnectionAuditDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditAIOConnection.findAll({ where: { aio_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific AIO.', err));
    }
}

exports.getLocationAuditDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditAIOLocation.findAll({ where: { aio_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific AIO.', err));
    }
}

exports.getAllConnectionAuditDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditAIOConnection.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

exports.getAllLocationAuditDeviceAIO = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditAIOLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

//Laptop Middleware Functions
exports.postDeviceLaptop = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            return next(createErrors.badRequest('Request must be an array of laptop devices.'));
        }

        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('Laptop');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number,
                brand_id, model, ups_id,
                processorDTO, connectionDTO, peripheralDTO,
                gpu_id, os_id, prod_id, security_id,
                accountable_user, co_accountable_user,
                ramDTO: ramModules,
                storageDTO: storageModules
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is required and must be a number.'));

            if (!Array.isArray(ramModules)) return next(createErrors.badRequest('ramDTO must be an array.'));
            if (!Array.isArray(storageModules)) return next(createErrors.badRequest('storageDTO must be an array.'));

            const isBatchExisting = await Batch.findByPk(batch_id, { transaction: t });
            if (!isBatchExisting) {
                await t.rollback();
                return next(createErrors.notFound("This batch doesn't exist."));
            }

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;

            const gpuResponse = await PartGPU.create({ capacity_id: gpu_id });

            const laptop = await Laptop.create({
                batch_id, section_id,
                device_number: deviceNum,
                serial_number, brand_id,
                model, is_condemned: false,
                ups_id, gpu_id: gpuResponse.id,
                os_id, prod_id, security_id,
                accountable_user, co_accountable_user
            }, { transaction: t });

            if (!processorDTO) return next(createErrors.badRequest("processorDTO must have a value"));
            if (typeof processorDTO !== 'object') return next(createErrors.badRequest('processorDTO must be an object'));

            const processor = await PartProcessor.create(processorDTO, { transaction: t });
            await ProcessorLaptop.create({
                laptop_id: laptop.id,
                cpu_id: processor.id
            }, { transaction: t });

            for (const { capacity_id } of ramModules) {
                const ram = await PartRAM.create({ capacity_id }, { transaction: t });

                await RAMLaptop.create({ laptop_id: laptop.id, ram_id: ram.id }, { transaction: t });
            }

            for (const { capacity_id, type_id } of storageModules) {
                const storage = await PartStorage.create({ capacity_id, type_id }, { transaction: t });

                await StorageLaptop.create({ laptop_id: laptop.id, storage_id: storage.id }, { transaction: t });
            }

            for (const connection_id of connectionDTO) {
                await ConnectionsLaptop.create({ laptop_id: laptop.id, connection_id }, { transaction: t });
            }

            for (const peripheral_id of peripheralDTO) {
                await PeripheralsLaptop.create({ laptop_id: laptop.id, peripheral_id }, { transaction: t });
            }

            savedDevices.push({ id: laptop.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} laptop device(s) saved successfully.`, devices: savedDevices });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on saving laptop.', err));
    }
}

exports.getAllDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Laptop.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all laptops.', err));
    }
}

exports.getAllDeviceLaptopByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Laptop.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all laptop by batch id.', err));
    }
}

exports.getAllCondemnedDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedLaptop = await Laptop.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedLaptop.map(laptop => laptop.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned laptops.', err));
    }
}

exports.getAllWorkingDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingLaptop = await Laptop.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingLaptop.map(laptop => laptop.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all working laptops.', err));
    }
}

exports.getDeviceLaptopById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const laptop = await Laptop.findByPk(id, {
            attributes: {
                exclude: ['gpu_id', 'created_at'] 
            },
            include: [
                {
                    model: ProcessorLaptop,
                    as: 'processor',
                    include: [{
                        model: PartProcessor,
                        as: 'cpu',
                        include: [{ 
                            model: BrandSeriesProcessor,
                            as: 'series',
                            include: [{
                                model: BrandProcessor,
                                as: 'brand'
                            }] 
                        }]
                    }]
                },
                {
                    model: PartGPU,
                    as: 'gpu',
                    include: [{ 
                        model: CapacityGPU,
                        as: 'capacity'
                    }]
                },
                {
                    model: RAMLaptop,
                    as: 'ram_modules',
                    include: [{ 
                        model: PartRAM, 
                        as: 'ram',
                        include: [{ 
                            model: CapacityRAM,
                            as: 'capacity'
                        }] 
                    }]
                },
                {
                    model: StorageLaptop,
                    as: 'storage_dto',
                    include: [{ 
                        model: PartStorage,
                        as: 'storage',
                        include: [
                            { model: CapacityStorage, as: 'capacity' }, 
                            { model: StorageType, as: 'type' }
                        ] 
                    }]
                },
                {
                    model: ConnectionsLaptop,
                    as: 'connections',
                    include: [{ 
                        model: Connection,
                        as: 'connection'
                    }]
                },
                {
                    model: PeripheralsLaptop,
                    as: 'peripherals',
                    include: [{ 
                        model: Peripheral,
                        as: 'peripheral'
                    }]
                }
            ]
        });

        if (!laptop) return next(createErrors.notFound("This laptop doesn't exists."));

        const json = laptop.toJSON();

        const result = {
            id: json.id,
            batch_id: json.batch_id,
            section_id: json.section_id,
            serial_number: json.serial_number,
            brand_id: json.brand_id,
            model: json.model,
            ups_id: json.ups_id,
            processorDTO: {
                series_id: json.processor?.cpu?.series_id || null,
                model: json.processor?.cpu?.model || null
            },
            ramDTO: json.ram_modules.map(ram => ({
                capacity_id: ram.ram?.capacity_id || null
            })),
            storageDTO: json.storage_dto.map(storage => ({
                capacity_id: storage.storage?.capacity_id || null,
                type_id: storage.storage?.type_id || null
            })),
            connectionDTO: json.connections.map(conn => conn.connection_id),
            peripheralDTO: json.peripherals.map(periph => periph.peripheral_id),
            gpu_id: json.gpu_id,
            os_id: json.os_id,
            prod_id: json.prod_id,
            security_id: json.security_id,
            accountable_user: json.accountable_user,
            co_accountable_user: json.co_accountable_user
        };

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific laptop.', err));
    }
}

exports.condemnedDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const laptop = await Laptop.findByPk(id);
        if (!laptop) return next(createErrors.notFound("This laptop doesn't exist."));

        await Laptop.update({ is_condemned: true }, { where: { id } });
        await CondemnedLaptop.create({ laptop_id: laptop.id, reason, condemned_by: req.user.id, condemned_at });
        await ConnectionsLaptop.destroy({ where: { laptop_id: id } });
        await PeripheralsLaptop.destroy({ where: { laptop_id: id } });

        res.status(200).json({ code: 200, message: `${laptop.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of laptop.', err));
    }
}

exports.putByIdDeviceLaptop = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
        const {
            section_id, serial_number, ups_id,
            processorDTO, connectionDTO, peripheralDTO,
            gpu_id, os_id, prod_id, security_id,
            accountable_user, co_accountable_user,
            ramDTO: ramModules,
            storageDTO: storageModules
        } = req.body;

        if (!Array.isArray(ramModules)) return next(createErrors.badRequest('ramDTO must be an array.'));
        if (!Array.isArray(storageModules)) return next(createErrors.badRequest('storageDTO must be an array.'));
        if (!Array.isArray(connectionDTO)) return next(createErrors.badRequest('connectionDTO must be an array'));
        if (!Array.isArray(peripheralDTO)) return next(createErrors.badRequest('peripheralDTO must be an array'));

        const laptop = await Laptop.findByPk(id, { transaction: t });
        if (!laptop) return next(createErrors.notFound("This laptop doesn't exists."));

        const oldGPU = await PartGPU.findByPk(laptop.gpu_id);

        await PartGPU.update({ capacity_id: gpu_id }, { where: { id: laptop.gpu_id }, transaction: t });

        const newGPU = await PartGPU.findByPk(laptop.gpu_id);

        const gpuReport = await generateGPUReport('UPDATE', oldGPU, newGPU);

        await AuditGPU.create({
            part_id: laptop.gpu_id, 
            old_capacity_id: oldGPU.capacity_id,
            new_capacity_id: gpu_id,
            action: 'UPDATE',
            report: gpuReport,
            updated_by: req.user.id,
            updated_at: new Date()
        }, { transaction: t });

        if (!processorDTO) return next(createErrors.badRequest("processorDTO must have a value"));
        if (typeof processorDTO !== 'object') return next(createErrors.badRequest('processorDTO must be an object'));

        const laptopProcessor = await ProcessorLaptop.findOne({ where: { laptop_id: id }, transaction: t });
        if (!laptopProcessor) return next(createErrors.notFound("ProcessorLaptop not found."));

        await PartProcessor.update(processorDTO, { where: { id: laptopProcessor.cpu_id }, transaction: t });

        const laptopRAMs = await RAMLaptop.findAll({ where: { laptop_id: id }, transaction: t });
        if (laptopRAMs.length !== ramModules.length) {
            return next(createErrors.badRequest('Mismatch between RAM modules provided associated RAM slots.'));
        }

        for (let i = 0; i < laptopRAMs.length; i++) {
            const ramLaptop = laptopRAMs[i];
            const { capacity_id } = ramModules[i];

            const oldRAM = await PartRAM.findByPk(ramLaptop.ram_id);
            if (!oldRAM) return next(createErrors.notFound(`PartRAM not found for ID ${ramLaptop.ram_id}`));

            if (oldRAM.capacity_id !== capacity_id) {
                await PartRAM.update({ capacity_id }, { where: { id: ramLaptop.ram_id }, transaction: t });

                const newRAM = await PartRAM.findByPk(ramLaptop.ram_id);
                const ramReport = await generateRAMReport('UPDATE', oldRAM, newRAM);

                await AuditRAM.create({
                    part_id: ramLaptop.ram_id,
                    old_capacity_id: oldRAM.capacity_id,
                    new_capacity_id: capacity_id,
                    action: 'UPDATE',
                    report: ramReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            }
        }

        const laptopStorages = await StorageLaptop.findAll({ where: { laptop_id: id }, transaction: t });
        if (laptopStorages.length !== storageModules.length) {
            return next(createErrors.badRequest('Mismatch between storage modules provided and associated storage slots.'));
        }

        for (let i = 0; i < laptopStorages.length; i++) {
            const storageLaptop = laptopStorages[i];
            const { capacity_id, type_id } = storageModules[i];

            const oldStorage = await PartStorage.findByPk(storageLaptop.storage_id);
            if (!oldStorage) return next(createErrors.notFound(`Storage part not found for ID ${storageLaptop.storage_id}.`));

            const needsUpdate = oldStorage.capacity_id !== capacity_id || oldStorage.type_id !== type_id;

            if (needsUpdate) {
                await PartStorage.update({ capacity_id, type_id }, { where: { id: storageLaptop.storage_id }, transaction: t });

                const newStorage = await PartStorage.findByPk(storageLaptop.storage_id);
                const storageReport = await generateStorageReport('UPDATE', oldStorage, newStorage);

                await AuditStorage.create({
                    part_id: storageLaptop.storage_id,
                    old_capacity_id: oldStorage.capacity_id,
                    old_type_id: oldStorage.type_id,
                    new_capacity_id: capacity_id,
                    new_type_id: type_id,
                    action: 'UPDATE',
                    report: storageReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            }
        }

        const existingConns = await ConnectionsLaptop.findAll({
            where: { laptop_id: id },
            attributes: ['connection_id'],
            raw: true,
            transaction: t
        });

        const existingConnIds = existingConns.map(c => c.connection_id);
        const newConnIds = connectionDTO;

        const toAdd = newConnIds.filter(id => !existingConnIds.includes(id));
        const toRemove = existingConnIds.filter(id => !newConnIds.includes(id));

        for (const connId of toRemove) {
            await ConnectionsLaptop.destroy({ where: { laptop_id: id, connection_id: connId }, transaction: t });

            await AuditLaptopConnection.create({
                laptop_id: id,
                connection_id: connId,
                action: 'REMOVE',
                changed_by: req.user.id,
                changed_at: new Date()
            }, { transaction: t });
        }

        for (const connId of toAdd) {
            await ConnectionsLaptop.create({ laptop_id: id, connection_id: connId }, { transaction: t });

            await AuditLaptopConnection.create({
                laptop_id: id,
                connection_id: connId,
                action: 'ADD',
                changed_by: req.user.id,
                changed_at: new Date()
            }, { transaction: t });
        }

        await PeripheralsLaptop.destroy({ where: { laptop_id: id }, transaction: t });

        await Promise.all(peripheralDTO.map(peripheral_id => PeripheralsLaptop.create({ laptop_id: id, peripheral_id }, { transaction: t })));

        if (laptop.section_id !== section_id) {
            const locationReport = await generateSectionReport(laptop.section_id, section_id);

            await AuditLaptopLocation.create({
                laptop_id: id,
                old_section_id: laptop.section_id,
                new_section_id: section_id,
                report: locationReport,
                updated_by: req.user.id,
                updated_at: new Date()
            }, { transaction: t });
        }

        await Laptop.update({
            section_id, serial_number, ups_id, 
            os_id, prod_id, security_id,
            accountable_user, co_accountable_user
        }, { where: { id }, transaction: t });

        await t.commit();
        res.status(200).json({ code: 200, message: 'Laptop device updated successfully.' })
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific laptop.', err));
    }
}

exports.deleteByIdDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const laptop = await Laptop.findByPk(id, {
            include: ['processor', 'ram_modules', 'storage_dto', 'connections', 'peripherals']
        });
        if (!laptop) return next(createErrors.notFound("Laptop device with this id doesn't exist."));

        if (laptop.processor) await laptop.processor.destroy();
        if (laptop.ram_modules) await Promise.all(laptop.ram_modules.map(r => r.destroy()));
        if (laptop.storage_dto) await Promise.all(laptop.storage_dto.map(s => s.destroy()));
        if (laptop.connections) await Promise.all(laptop.connections.map(c => c.destroy()));
        if (laptop.peripherals) await Promise.all(laptop.peripherals.map(p => p.destroy()));

        await laptop.destroy();

        res.status(200).json({ code: 200, message: `${laptop.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific laptop.', err));
    }
}

exports.getConnectionAuditDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditLaptopConnection.findAll({ where: { laptop_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific laptop.', err));
    }
}

exports.getLocationAuditDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditLaptopLocation.findAll({ where: { laptop_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific laptop.', err));
    }
}

exports.getAllConnectionAuditDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditLaptopConnection.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

exports.getAllLocationAuditDeviceLaptop = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditLaptopLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

//Computer Middleware Functions
exports.postDeviceComputer = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            return next(createErrors.badRequest('Request must be an array of laptop devices.'));
        }

        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('Computer');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number, ups_id,
                processorDTO, connectionDTO, peripheralDTO,
                gpu_id, os_id, prod_id, security_id,
                accountable_user, co_accountable_user,
                motherboardDTO, ramDTO: ramModules,
                storageDTO: storageModules
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is required and must be a number.'));

            if (!Array.isArray(ramModules)) return next(createErrors.badRequest('ramDTO must be an array.'));
            if (!Array.isArray(storageModules)) return next(createErrors.badRequest('storageDTO must be an array.'));

            const isBatchExisting = await Batch.findByPk(batch_id, { transaction: t });
            if (!isBatchExisting) {
                await t.rollback();
                return next(createErrors.notFound("This batch doesn't exist."));
            }

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;

            const gpuResponse = await PartGPU.create({ capacity_id: gpu_id });

            const computer = await Computer.create({
                batch_id, section_id,
                device_number: deviceNum,
                serial_number, is_condemned: false,
                ups_id, gpu_id: gpuResponse.id,
                os_id, prod_id, security_id,
                accountable_user, co_accountable_user
            }, { transaction: t });

            if (!processorDTO) return next(createErrors.badRequest("processorDTO must have a value"));
            if (typeof processorDTO !== 'object') return next(createErrors.badRequest('processorDTO must be an object'));

            const processor = await PartProcessor.create(processorDTO, { transaction: t });
            await ProcessorComputer.create({
                computer_id: computer.id,
                cpu_id: processor.id
            }, { transaction: t });

            if (!motherboardDTO) return next(createErrors.badRequest("motherboardDTO must have a value"));
            if (typeof motherboardDTO !== 'object') return next(createErrors.badRequest('motherboardDTO must be an object'));

            const motherboard = await PartMotherboard.create(motherboardDTO, { transaction: t });
            await MotherboardComputer.create({
                computer_id: computer.id,
                mobo_id: motherboard.id
            }, { transaction: t });

            for (const { capacity_id } of ramModules) {
                const ram = await PartRAM.create({ capacity_id }, { transaction: t });

                await RAMComputer.create({ computer_id: computer.id, ram_id: ram.id }, { transaction: t });
            }

            for (const { capacity_id, type_id } of storageModules) {
                const storage = await PartStorage.create({ capacity_id, type_id }, { transaction: t });

                await StorageComputer.create({ computer_id: computer.id, storage_id: storage.id }, { transaction: t });
            }

            for (const connection_id of connectionDTO) {
                await ConnectionsComputer.create({ computer_id: computer.id, connection_id }, { transaction: t });
            }

            for (const peripheral_id of peripheralDTO) {
                await PeripheralsComputer.create({ computer_id: computer.id, peripheral_id }, { transaction: t });
            }

            savedDevices.push({ id: computer.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} computer device(s) saved successfully.`, devices: savedDevices });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on saving computer.', err));
    }
}

exports.getAllDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Computer.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all computers.', err));
    }
}

exports.getAllDeviceComputerByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Computer.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all computers by batch id.', err));
    }
}

exports.getAllCondemnedDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedComputer = await Computer.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedComputer.map(computer => computer.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned computers.', err));
    }
}

exports.getAllWorkingDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingComputer = await Computer.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingComputer.map(computer => computer.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all working computers.', err));
    }
}

exports.getDeviceComputerById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const computer = await Computer.findByPk(id, {
            attributes: {
                exclude: ['gpu_id', 'created_at']
            },
            include: [
                {
                    model: ProcessorComputer,
                    as: 'processor',
                    include: [{
                        model: PartProcessor,
                        as: 'cpu',
                        include: [{
                            model: BrandSeriesProcessor,
                            as: 'series',
                            include: [{
                                model: BrandProcessor,
                                as: 'brand'
                            }]
                        }]
                    }]
                },
                {
                    model: PartGPU,
                    as: 'gpu',
                    include: [{
                        model: CapacityGPU,
                        as: 'capacity'
                    }]
                },
                {
                    model: RAMComputer,
                    as: 'ram_modules',
                    include: [{
                        model: PartRAM,
                        as: 'ram',
                        include: [{
                            model: CapacityRAM,
                            as: 'capacity'
                        }]
                    }]
                },
                {
                    model: StorageComputer,
                    as: 'storage_dto',
                    include: [{
                        model: PartStorage,
                        as: 'storage',
                        include: [
                            { model: CapacityStorage, as: 'capacity' },
                            { model: StorageType, as: 'type' }
                        ]
                    }]
                },
                {
                    model: ConnectionsComputer,
                    as: 'connections',
                    include: [{
                        model: Connection,
                        as: 'connection'
                    }]
                },
                {
                    model: PeripheralsComputer,
                    as: 'peripherals',
                    include: [{
                        model: Peripheral,
                        as: 'peripheral'
                    }]
                }
            ]
        });

        if (!computer) return next(createErrors.notFound("This computer doesn't exists."));

        const json = computer.toJSON();

        const result = {
            id: json.id,
            batch_id: json.batch_id,
            section_id: json.section_id,
            serial_number: json.serial_number,
            ups_id: json.ups_id,
            processorDTO: {
                series_id: json.processor?.cpu?.series_id || null,
                model: json.processor?.cpu?.model || null
            },
            ramDTO: json.ram_modules.map(ram => ({
                capacity_id: ram.ram?.capacity_id || null
            })),
            storageDTO: json.storage_dto.map(storage => ({
                capacity_id: storage.storage?.capacity_id || null,
                type_id: storage.storage?.type_id || null
            })),
            connectionDTO: json.connections.map(conn => conn.connection_id),
            peripheralDTO: json.peripherals.map(periph => periph.peripheral_id),
            gpu_id: json.gpu_id,
            os_id: json.os_id,
            prod_id: json.prod_id,
            security_id: json.security_id,
            accountable_user: json.accountable_user,
            co_accountable_user: json.co_accountable_user
        };

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific computer.', err));
    }
}

exports.condemnedDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const computer = await Computer.findByPk(id);
        if (!computer) return next(createErrors.notFound("This computer doesn't exist."));

        await Computer.update({ is_condemned: true }, { where: { id } });
        await CondemnedComputer.create({ computer_id: id, reason, condemned_by: req.user.id, condemned_at });
        await ConnectionsComputer.destroy({ where: { computer_id: id } });
        await PeripheralsComputer.destroy({ where: { computer_id: id } });
        
        res.status(200).json({ code: 200, message: `${computer.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of computer.', err));
    }
}

exports.putByIdDeviceComputer = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
        const {
            section_id, serial_number, ups_id,
            processorDTO, connectionDTO, peripheralDTO,
            gpu_id, os_id, prod_id, security_id,
            accountable_user, co_accountable_user,
            motherboardDTO, ramDTO: ramModules,
            storageDTO: storageModules
        } = req.body;

        if (!Array.isArray(ramModules)) return next(createErrors.badRequest('ramDTO must be an array.'));
        if (!Array.isArray(storageModules)) return next(createErrors.badRequest('storageDTO must be an array.'));
        if (!Array.isArray(connectionDTO)) return next(createErrors.badRequest('connectionDTO must be an array'));
        if (!Array.isArray(peripheralDTO)) return next(createErrors.badRequest('peripheralDTO must be an array'));

        const computer = await Computer.findByPk(id, { transaction: t });
        if (!computer) return next(createErrors.notFound("This computer doesn't exists."));
        
        const oldGPU = await PartGPU.findByPk(computer.gpu_id);

        await PartGPU.update({ capacity_id: gpu_id }, { where: { id: computer.gpu_id }, transaction: t });

        const newGPU = await PartGPU.findByPk(computer.gpu_id);

        const gpuReport = await generateGPUReport('UPDATE', oldGPU, newGPU);

        await AuditGPU.create({
            part_id: computer.gpu_id,
            old_capacity_id: oldGPU.capacity_id,
            new_capacity_id: gpu_id,
            action: 'UPDATE',
            report: gpuReport,
            updated_by: req.user.id,
            updated_at: new Date()
        }, { transaction: t });

        if (!processorDTO) return next(createErrors.badRequest("processorDTO must have a value"));
        if (typeof processorDTO !== 'object') return next(createErrors.badRequest('processorDTO must be an object'));

        const computerProcessor = await ProcessorComputer.findOne({ where: { computer_id: id }, transaction: t });
        if (!computerProcessor) return next(createErrors.notFound("ProcessorComputer not found."));

        await PartProcessor.update(processorDTO, { where: { id: computerProcessor.cpu_id }, transaction: t });

        if (!motherboardDTO) return next(createErrors.badRequest("motherboardDTO must have a value"));
        if (typeof motherboardDTO !== 'object') return next(createErrors.badRequest('motherboardDTO must be an object'));

        const computerMotherboard = await MotherboardComputer.findOne({ where: { computer_id: id }, transaction: t });
        if (!computerMotherboard) return next(createErrors.notFound("MotherboardComputer not found."));

        await PartMotherboard.update(motherboardDTO, { where: { id: computerMotherboard.mobo_id }, transaction: t });

        const computerRAMs = await RAMComputer.findAll({ where: { computer_id: id }, transaction: t });
        if (computerRAMs.length !== ramModules.length) {
            return next(createErrors.badRequest('Mismatch between RAM modules provide associated RAM slots.'));
        }

        for (let i = 0; i < computerRAMs.length; i++) {
            const ramComputer = computerRAMs[i];
            const { capacity_id } = ramModules[i];

            const oldRAM = await PartRAM.findByPk(ramComputer.ram_id);
            if (!oldRAM) return next(createErrors.notFound(`PartRAM not found for ID ${ramComputer.ram_id}.`));

            if (oldRAM.capacity_id !== capacity_id) {
                await PartRAM.update({ capacity_id }, { where: { id: ramComputer.ram_id }, transaction: t });

                const newRAM = await PartRAM.findByPk(ramComputer.ram_id);
                const ramReport = await generateRAMReport('UPDATE', oldRAM, newRAM);

                await AuditRAM.create({
                    part_id: ramComputer.ram_id,
                    old_capacity_id: oldRAM.capacity_id,
                    new_capacity_id: capacity_id,
                    action: 'UPDATE',
                    report: ramReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            }
        }

        const computerStorages = await StorageComputer.findAll({ where: { computer_id: id }, transaction: t });
        if (computerStorages.length !== storageModules.length) {
            return next(createErrors.badRequest('Mismatch between storage modules provided and associated storage slots.'));
        }

        for (let i = 0; i < computerStorages.length; i++) {
            const storageComputer = computerStorages[i];
            const { capacity_id, type_id } = storageModules[i];

            const oldStorage = await PartStorage.findByPk(storageComputer.storage_id);
            if (!oldStorage) return next(createErrors.notFound(`Storage part not found for ID ${storageComputer.storage_id}`));

            const needsUpdate = oldStorage.capacity_id !== capacity_id || oldStorage.type_id !== type_id;

            if (needsUpdate) {
                await PartStorage.update({ capacity_id, type_id }, { where: { id: storageComputer.storage_id }, transaction: t });

                const newStorage = await PartStorage.findByPk(storageComputer.storage_id);
                const storageReport = await generateStorageReport('UPDATE', oldStorage, newStorage);

                await AuditStorage.create({
                    part_id: storageComputer.storage_id,
                    old_capacity_id: oldStorage.capacity_id,
                    old_type_id: oldStorage.type_id,
                    new_capacity_id: capacity_id,
                    new_type_id: type_id,
                    action: 'UPDATE',
                    report: storageReport,
                    updated_by: req.user.id,
                    updated_at: new Date()
                }, { transaction: t });
            }
        }

        const existingConns = await ConnectionsComputer.findAll({
            where: { computer_id: id },
            attributes: ['connection_id'],
            raw: true,
            transaction: t
        });

        const existingConnsIds = existingConns.map(c => c.connection_id);
        const newConnIds = connectionDTO;

        const toAdd = newConnIds.filter(id => !existingConnsIds.includes(id));
        const toRemove = existingConnsIds.filter(id => !newConnIds.includes(id));

        for (const connId of toRemove) {
            await ConnectionsComputer.destroy({ where: { computer_id: id, connection_id: connId }, transaction: t });

            await AuditComputerConnection.create({
                computer_id: id,
                connection_id: connId,
                action: 'REMOVE',
                changed_by: req.user.id,
                changed_at: new Date()
            }, { transaction: t });
        }

        for (const connId of toAdd) {
            await ConnectionsComputer.create({ computer_id: id, connection_id: connId }, { transaction: t });

            await AuditComputerConnection.create({
                computer_id: id,
                connection_id: connId,
                action: 'ADD',
                changed_by: req.user.id,
                changed_at: new Date()
            }, { transaction: t });
        }

        await PeripheralsComputer.destroy({ where: { computer_id: id }, transaction: t });

        await Promise.all(peripheralDTO.map(peripheral_id => PeripheralsComputer.create({ computer_id: id, peripheral_id }, { transaction: t })));

        if (computer.section_id !== section_id) {
            const locationReport = await generateSectionReport(computer.section_id, section_id);

            await AuditComputerLocation.create({
                computer_id: id,
                old_section_id: computer.section_id,
                new_section_id: section_id,
                report: locationReport,
                updated_by: req.user.id,
                updated_at: new Date()
            }, { transaction: t });
        }

        await Computer.update({
            section_id, serial_number, ups_id, 
            os_id, prod_id, security_id,
            accountable_user, co_accountable_user,
        }, { where: { id }, transaction: t });

        await t.commit();
        res.status(200).json({ code: 200, message: 'Computer device updated successfully.' });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific computer.', err));
    }
}

exports.deleteByIdDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const computer = await Computer.findByPk(id, {
            include: ['processor', 'motherboard', 'ram_modules', 'storage_dto', 'connections', 'peripherals']
        });
        if (!computer) return next(createErrors.notFound("Computer device with this id doesn't exist."));

        if (comp.processor) await comp.processor.destroy();
        if (comp.motherboard) await comp.motherboard.destroy();
        if (comp.ram_modules) await Promise.all(comp.ram_modules.map(r => r.destroy()));
        if (comp.storage_dto) await Promise.all(comp.storage_dto.map(s => s.destroy()));
        if (comp.connections) await Promise.all(comp.connections.map(c => c.destroy()));
        if (comp.peripherals) await Promise.all(comp.peripherals.map(p => p.destroy()));

        await comp.destroy();

        res.status(200).json({ code: 200, message: `${computer.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific computer.', err));
    }
}

exports.getConnectionAuditDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditComputerConnection.findAll({ where: { computer_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific computer.', err));
    }
}

exports.getLocationAuditDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditComputerLocation.findAll({ where: { computer_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific computer.', err));
    }
}

exports.getAllConnectionAuditDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditComputerConnection.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

exports.getAllLocationAuditDeviceComputer = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditComputerLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

//Tablet Middleware Functions
exports.postDeviceTablet = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            return next(createErrors.badRequest('Request must be an array of AIO devices.'));
        }

        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('Tablet');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number,
                brand_id, model,
                chipsetDTO, connectionDTO, 
                peripheralDTO, ram_capacity_id,
                storage_capacity_id,
                accountable_user, co_accountable_user
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is required and must be a number.'));

            const isBatchExisting = await Batch.findByPk(batch_id, { transaction: t });
            if (!isBatchExisting) {
                await t.rollback();
                return next(createErrors.notFound("This batch doesn't exist."));
            }

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;

            const isRAMExisting = await CapacityRAM.findByPk(ram_capacity_id);
            if (!isRAMExisting) return next(createErrors.badRequest("RAM capacity with this id doesn't exist."));

            const isStorageExisting = await CapacityStorage.findByPk(storage_capacity_id);
            if (!isStorageExisting) return next(createErrors.badRequest("Storage capacity with this id doesn't exist."));

            const tablet = await Tablet.create({
                batch_id, section_id,
                device_number: deviceNum,
                serial_number, brand_id,
                model, is_condemned: false,
                ram_capacity_id, storage_capacity_id,
                accountable_user, co_accountable_user
            }, { transaction: t });

            if (!chipsetDTO) return next(createErrors.badRequest('chipsetDTO must have a value.'));
            if (typeof chipsetDTO !== 'object') return next(createErrors.badRequest('chipsetDTO must be an object.'));

            const chipset = await PartChipset.create(chipsetDTO, { transaction: t });
            await ChipsetTablet.create({
                tablet_id: tablet.id,
                cpu_id: chipset.id
            }, { transaction: t });

            for (const connection_id of connectionDTO) {
                await ConnectionsTablet.create({ tablet_id: tablet.id, connection_id }, { transaction: t });
            }

            for (const peripheral_id of peripheralDTO) {
                await PeripheralsTablet.create({ tablet_id: tablet.id, peripheral_id }, { transaction: t });
            }

            savedDevices.push({ id: tablet.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} tablet device(s) saved successfully.`, devices: savedDevices });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on saving tablets.', err));
    }
}

exports.getAllDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Tablet.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all tablets.', err));
    }
}

exports.getAllDeviceTabletByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Tablet.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all tablets by batch id.', err));
    }
}

exports.getAllCondemnedDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedTablet = await Tablet.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedTablet.map(tablet => tablet.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned tablets.', err));
    }
}

exports.getAllWorkingDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingTablet = await Tablet.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingTablet.map(tablet => tablet.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all working tablets.', err));
    }
}

exports.getDeviceTabletById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const tablet = await Tablet.findByPk(id, {
            attributes: [
                'id', 'batch_id', 'section_id', 'serial_number',
                'brand_id', 'model', 'ram_capacity_id', 'storage_capacity_id',
                'accountable_user', 'co_accountable_user'
            ],
            include: [
                {
                    model: ChipsetTablet,
                    as: 'chipset',
                    include: [{
                        model: PartChipset,
                        as: 'chipset_part',
                        attributes: ['brand_id', 'model']
                    }]
                },
                {
                    model: ConnectionsTablet,
                    as: 'connections',
                    attributes: ['connection_id']
                },
                {
                    model: PeripheralsTablet,
                    as: 'peripherals',
                    include: [{
                        model: Peripheral,
                        as: 'peripheral'
                    }]
                }
            ]
        });

        if (!tablet) return next(createErrors.notFound(`Tablet with ID ${id} not found.`));

        const json = tablet.toJSON();

        const response = {
            id: json.id,
            batch_id: json.batch_id,
            section_id: json.section_id,
            serial_number: json.serial_number,
            brand_id: json.brand_id,
            model: json.model,
            chipsetDTO: json.chipset?.chipset_part
                ? {
                    brand_id: json.chipset.chipset_part.brand_id,
                    model: json.chipset.chipset_part.model
                }
                : null,
            ram_capacity_id: json.ram_capacity_id,
            storage_capacity_id: json.storage_capacity_id,
            connectionDTO: json.connections?.map(c => c.connection_id) || [],
            peripheralDTO: json.peripherals?.map(p => p.peripheral_id) || [],
            accountable_user: json.accountable_user,
            co_accountable_user: json.co_accountable_user
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific tablet.', err));
    }
}

exports.condemnedDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const tablet = await Tablet.findByPk(id);
        if (!tablet) return next(createErrors.notFound("This tablet doesn't exist."));

        await Tablet.update({ is_condemned: true }, { where: { id } });
        await CondemnedTablet.create({ tablet_id: id, reason, condemned_by: req.user.id, condemned_at });
        await ConnectionsTablet.destroy({ where: { tablet_id: id } });
        await PeripheralsTablet.destroy({ where: { tablet_id: id } });

        res.status(200).json({ code: 200, message: `${tablet.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of tablet.', err));
    }
}

exports.putByIdDeviceTablet = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
      
        const { 
            section_id, serial_number,
            chipsetDTO, connectionDTO, 
            peripheralDTO, ram_capacity_id,
            storage_capacity_id,
            accountable_user, co_accountable_user 
        } = req.body;

        if (typeof chipsetDTO !== 'object') return next(createErrors.badRequest("chipsetDTO must be an object."));
        if (!Array.isArray(connectionDTO)) return next(createErrors.badRequest("connectionDTO must be an array."));
        if (!Array.isArray(peripheralDTO)) return next(createErrors.badRequest("peripheralDTO must be an array."));

        const tablet = await Tablet.findByPk(id, { transaction: t });
        if (!tablet) return next(createErrors.notFound("This tablet doesn't exists."));

        const tabletChipset = await ChipsetTablet.findOne({ where: { tablet_id: id }, transaction: t });
        if (!tabletChipset) return next(createErrors.notFound("ChipsetTablet not found."));

        await PartChipset.update(chipsetDTO, { where: { id: tabletChipset.cpu_id }, transaction: t });

        const existingConns = await ConnectionsTablet.findAll({
            where: { tablet_id: id },
            attributes: ['connection_id'],
            raw: true,
            transaction: t
        });

        const existingConnsIds = existingConns.map(c => c.connection_id);
        const newConnIds = connectionDTO;

        const toAdd = newConnIds.filter(id => !existingConnsIds.includes(id));
        const toRemove = existingConnsIds.filter(id => !newConnIds.includes(id));

        for (const connId of toRemove) {
            await ConnectionsTablet.destroy({ where: { tablet_id: id, connection_id: connId }, transaction: t });

            await AuditTabletConnection.create({
                tablet_id: id,
                connection_id: connId,
                action: 'REMOVE',
                changed_by: req.user.id
            }, { transaction: t });
        }

        for (const connId of toAdd) {
            await ConnectionsTablet.create({ tablet_id: id, connection_id: connId }, { transaction: t });

            await AuditTabletConnection.create({
                tablet_id: id,
                connection_id: connId,
                action: 'ADD',
                changed_by: req.user.id,
                changed_at: new Date()
            }, { transaction: t });
        }

        await PeripheralsTablet.destroy({ where: { tablet_id: id }, transaction: t });

        await Promise.all(peripheralDTO.map(peripheral_id => PeripheralsTablet.create({ tablet_id: id, peripheral_id }, { transaction: t })));

        if (tablet.section_id !== section_id) {
            const locationReport = await generateSectionReport(tablet.section_id, section_id);

            await AuditTabletLocation.create({
                tablet_id: id,
                old_section_id: tablet.section_id,
                new_section_id: section_id,
                report: locationReport,
                updated_by: req.user.id,
                updated_at: new Date()
            }, { transaction: t });
        }

        const isRAMExisting = await CapacityRAM.findByPk(ram_capacity_id, { transaction: t });
        if (!isRAMExisting) return next(createErrors.notFound("RAM with this id doesn't exist."));

        const isStorageExisting = await CapacityStorage.findByPk(storage_capacity_id, { transaction: t });
        if (!isStorageExisting) return next(createErrors.notFound("Storage with this id doesn't exist."));

        await Tablet.update({
            section_id, serial_number,
            ram_capacity_id, storage_capacity_id,
            accountable_user, co_accountable_user
        }, { where: { id }, transaction: t });

        await t.commit();

        res.status(200).json({ code: 200, message: 'Tablet device updated successfully.' });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific tablet.', err));
    }
}

exports.deleteByIdDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const tablet = await Tablet.findByPk(id, {
            include: ['chipset', 'connections', 'peripherals']
        });
        if (!tablet) return next(createErrors.notFound("Tablet device with this id doesn't exist."));

        if (tablet.chipset) await tablet.chipset.destroy();
        if (tablet.connections) await Promise.all(tablet.connections.map(c => c.destroy()));
        if (tablet.peripherals) await Promise.all(tablet.peripherals.map(p => p.destroy()));

        await tablet.destroy();

        res.status(200).json({ code: 200, message: `${tablet.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific tablet.', err));
    }
}

exports.getConnectionAuditDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditTabletConnection.findAll({ where: { tablet_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific tablet.', err));
    }
}

exports.getLocationAuditDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditTabletLocation.findAll({ where: { tablet_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific tablet.', err));
    }
}

exports.getAllConnectionAuditDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditTabletConnection.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

exports.getAllLocationAuditDeviceTablet = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditTabletLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

//Router Middleware Functions
exports.postDeviceRouter = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            return next(createErrors.badRequest('Request must be an array of router devices.'));
        }

        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('Router');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number,
                brand_id, model, network_speed_id,
                antenna_id, accountable_user, co_accountable_user
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is request and must be a number.'));

            const isBatchExisting = await Batch.findByPk(batch_id, { transaction: t });
            const isNetworkSpeedExisting = await NetworkSpeed.findByPk(network_speed_id, { transaction: t });
            const isAntennaExisting = await AntennaCount.findByPk(antenna_id, { transaction: t });

            if (!isBatchExisting) {
                await t.rollback();
                return next(createErrors.notFound("This batch doesn't exist."));
            }

            if (!isNetworkSpeedExisting) {
                await t.rollback();
                return next(createErrors.notFound("This network speed doesn't exist."));
            }

            if (!isAntennaExisting) {
                await t.rollback();
                return next(createErrors.notFound("This antenna count doesn't exist."));
            }

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;
            
            const router = await Router.create({
                batch_id, section_id, serial_number,
                brand_id, model,
                device_number: deviceNum, 
                is_condemned: false,
                network_speed_id, antenna_id,
                accountable_user, co_accountable_user
            });

            savedDevices.push({ id: router.id, device_number: deviceNum });
        }
        
        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} router device(s) saved successfully.`, devices: savedDevices });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on saving router.', err));
    }
}

exports.getAllDeviceRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Router.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all routers.', err));
    }
}

exports.getAllDeviceRouterByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Router.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all tablets by batch id.', err));
    }
}

exports.getAllCondemnedDeviceRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedRouter = await Router.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedRouter.map(router => router.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned routers.', err));
    }
}

exports.getAllWorkingDeviceRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingRouter = await Router.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingRouter.map(router => router.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all working routers.', err));
    }
}

exports.getDeviceRouterById = async (req, res, next) => {
    try {
        requestValidation(req, next); 

        const { id } = req.params;

        const router = await Router.findByPk(id, {
            attributes: {
                exclude: ['created_at']
            }
        });

        if (!router) return next(createErrors.notFound("This router doesn't exists."));

        res.status(200).json(router);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific router.', err));
    }
}

exports.condemnedDeviceRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const router = await Router.findByPk(id);
        if (!router) return next(createErrors.notFound("This router doesn't exist."));

        await Router.update({ is_condemned: true }, { where: { id } });
        await CondemnedRouter.create({ router_id: id, reason, condemned_by: req.user.id, condemned_at });

        res.status(200).json({ code: 200, message: `${router.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of router.', err));
    }
}

exports.putByIdDeviceRouter = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
        const {
            section_id, serial_number,
            network_speed_id, antenna_id,
            accountable_user, co_accountable_user
        } = req.body

        const router = await Router.findByPk(id, { transaction: t });
        if (!router) return next(createErrors.notFound("This router doesn't exists."));
        
        const isAntennaExisting = await AntennaCount.findByPk(antenna_id);
        const isSpeedExisting = await NetworkSpeed.findByPk(network_speed_id);

        if (!isAntennaExisting) return next(createErrors.notFound("This id of antenna count doesn't exist."));
        if (!isSpeedExisting) return next(createErrors.notFound("This id of network speed doesn't exist."));

        await Router.update({
            section_id, serial_number,
            network_speed_id, antenna_id,
            accountable_user, co_accountable_user
        }, { where: { id }, transaction: t });

        await t.commit();
        res.status(200).json({ code: 200, message: 'Router device updated successfully' });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific router.', err));
    }
}

exports.deleteByIdDeviceRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const router = await Router.findOne({ where: { id } });
        if (!router) return next(createErrors.notFound("Router device with this id doesn't exist."));

        await Router.destroy({ where: { id } });

        res.status(200).json({ code: 200, message: `${router.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific router.', err));
    }
}

exports.getLocationAuditDeviceRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditRouterLocation.findAll({ where: { router_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific router.', err));
    }
}

exports.getAllLocationAuditDeviceRouter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditRouterLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all AIO.', err));
    }
}

//Printer Middlware Functions
exports.postDevicePrinter = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            return next(createErrors.badRequest('Request must be an array of printer devices.'));
        }

        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('Printer');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number,
                brand_id, model, type_id, with_scanner,
                accountable_user, co_accountable_user
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is required and must be a number.'));
            if (typeof with_scanner !== 'boolean') return next(createErrors.badRequest('with_scanner should be a boolean'));

            const isBatchExisting = await Batch.findByPk(batch_id, { transaction: t });
            if (!isBatchExisting) {
                await t.rollback();
                return next(createErrors.notFound("This batch doesn't exist."));
            }

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;

            const printer = await Printer.create({
                batch_id,section_id,
                device_number: deviceNum,
                serial_number, is_condemned: false,
                brand_id, model, type_id,
                with_scanner,
                accountable_user, co_accountable_user
            }, { transaction: t });

            savedDevices.push({ id: printer.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} printer device(s) saved successfully.`, devices: savedDevices });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving printer.', err));
    }
}

exports.getAllDevicePrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Printer.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printers.', err));
    }
}

exports.getAllDevicePrinterByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Printer.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all printers by batch id.', err));
    }
}

exports.getAllCondemnedDevicePrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedPrinter = await Printer.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedPrinter.map(printer => printer.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned printers.', err));
    }
}

exports.getAllWorkingDevicePrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingPrinter = await Printer.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingPrinter.map(printer => printer.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all working printers.', err));
    }
}

exports.getDevicePrinterById = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const printer = await Printer.findByPk(id, {
            attributes: {
                exclude: ['created_at']
            }
        });

        if (!printer) return next(createErrors.notFound("This printer doesn't exists."));
        
        res.status(200).json(printer);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific printer.', err));
    }
}

exports.condemnedDevicePrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const printer = await Printer.findByPk(id);
        if (!printer) return next(createErrors.notFound("This printer doesn't exist."));

        await Printer.update({ is_condemned: true }, { where: { id } });
        await CondemnedPrinter.create({ printer_id: id, reason, condemned_by: req.user.id, condemned_at });

        res.status(200).json({ code: 200, message: `${printer.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of printer.', err));
    }
}

exports.putByIdDevicePrinter = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
        const {
            section_id, serial_number,
            type_id, with_scanner,
            accountable_user, co_accountable_user
        } = req.body;

        const isTypeExisting = await PrinterType.findByPk(type_id);
        if (!isTypeExisting) return next(createErrors.notFound("This id of printer type doesn't exist."));

        if (typeof with_scanner !== 'boolean') return next(createErrors.badRequest('with_scanner should be a boolean'));

        const printer = await Printer.findByPk(id, { transaction: t });
        if (!printer) return next(createErrors.notFound("This printer doesn't exists."));

        await Printer.update({
            section_id, serial_number,
            type_id, with_scanner,
            accountable_user, co_accountable_user
        }, { where: { id }, transaction: t });

        await t.commit();
        res.status(200).json({ code: 200, message: 'Printer device updated successfully.' });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific printer.', err));
    }
}

exports.deleteByIdDevicePrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const printer = await Printer.findOne({ where: { id } });
        if (!printer) return next(createErrors.notFound("Printer device with this id doesn't exist."));

        await Printer.destroy({ where: { id } });

        res.status(200).json({ code: 200, message: `${printer.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific printer.', err));
    }
}

exports.getLocationAuditDevicePrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditPrinterLocation.findAll({ where: { printer_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific printer.', err));
    }
}

exports.getAllLocationAuditDevicePrinter = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditPrinterLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all printer.', err));
    }
}

//Scanner Middlware Functions
exports.postDeviceScanner = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            return next(createErrors.badRequest('Request must be an array of router devices.'));
        }

        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('Scanner');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number,
                brand_id, model, type_id,
                accountable_user, co_accountable_user
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is required and must be a number.'));

            const isTypeExisting = await ScannerType.findByPk(type_id);
            if (!isTypeExisting) {
                await t.rollback();
                return next(createErrors.notFound("This batch doesn't exist."));
            }

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;

            const scanner = await Scanner.create({
                batch_id, section_id, serial_number,
                brand_id, model, type_id,
                device_number: deviceNum,
                is_condemned: false,
                accountable_user, co_accountable_user
            });

            savedDevices.push({ id: scanner.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} scanner device(s) saved successfully` , devices: savedDevices });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving scanner.', err));
    }
}

exports.getAllDeviceScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await Scanner.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all scanners.', err));
    }
}


exports.getAllDeviceScannerByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await Scanner.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all scanners by batch id.', err));
    }
}

exports.getAllCondemnedDeviceScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedScanner = await Scanner.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedScanner.map(scanner => scanner.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned scanners.', err));
    }
}

exports.getAllWorkingDeviceScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingScanner = await Scanner.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingScanner.map(scanner => scanner.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned scanners.', err));
    }
}

exports.getDeviceScannerById = async (req, res, next) => {
    try {
        requestValidation(req, next); 

        const { id } = req.params;

        const scanner = await Scanner.findByPk(id, {
            attributes: {
                exclude: ['created_at']
            }
        });

        if (!scanner) return next(createErrors.notFound("This scanner doesn't exists."));

        res.status(200).json(scanner);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific scanner.', err));
    }
}

exports.condemnedDeviceScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const scanner = await Scanner.findByPk(id);
        if (!scanner) return next(createErrors.notFound("This scanner doesn't exist."));

        await Scanner.update({ is_condemned: true }, { where: { id } });
        await CondemnedScanner.create({ scanner_id: id, reason, condemned_by: req.user.id, condemned_at });

        res.status(200).json({ code: 200, message: `${scanner.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of scanner.', err));
    }
}

exports.putByIdDeviceScanner = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
        const {
            section_id, serial_number,
            type_id, accountable_user, co_accountable_user
        } = req.body;

        const isTypeExisting = await ScannerType.findByPk(type_id);
        if (!isTypeExisting) return next(createErrors.notFound("This batch doesn't exist."));
        
        const scanner = await Scanner.findByPk(id, { transaction: t });
        if (!scanner) return next(createErrors.notFound("This scanner doesn't exists."));

        await Scanner.update(
            { section_id, serial_number, type_id, accountable_user, co_accountable_user },
            { where: { id }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ code: 200, message: 'Scanner device updated successfully.' });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific scanner.', err));
    }
}

exports.deleteByIdDeviceScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const scanner = await Scanner.findOne({ where: { id } });
        if (!scanner) return next(createErrors.notFound("Scanner device with this id doesn't exist."));

        await Scanner.destroy({ where: { id } });

        res.status(200).json({ code: 200, message: `${scanner.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific scanner.', err));
    }
}

exports.getLocationAuditDeviceScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditScannerLocation.findAll({ where: { scanner_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific scanner.', err));
    }
}

exports.getAllLocationAuditDeviceScanner = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditScannerLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all scanner.', err));
    }
}

//UPS Middleware Functions
exports.postDeviceUPS = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const payload = Array.isArray(req.body) ? req.body : [ req.body ];
        if (!payload.length) {
            return next(createErrors.badRequest('Request must be an array of router devices.'));
        }

        const savedDevices = [];

        const { next: baseNumber, prefix } = await setDeviceNumber('UPS');
        let counter = baseNumber;

        for (const device of payload) {
            const {
                batch_id, section_id, serial_number,
                brand_id, model, volt_amperes,
                accountable_user, co_accountable_user
            } = device;

            if (!batch_id || typeof batch_id !== 'number') return next(createErrors.badRequest('batch_id is required and must be a number.'));

            const deviceNum = `${prefix}-${String(counter).padStart(3, '0')}`;
            counter++;

            const ups = await UPS.create({
                batch_id, section_id, serial_number,
                brand_id, model, volt_amperes,
                device_number: deviceNum,
                is_condemned: false, is_available: true,
                accountable_user, co_accountable_user
            });

            savedDevices.push({ id: ups.id, device_number: deviceNum });
        }

        await t.commit();
        res.status(201).json({ code: 201, message: `${savedDevices.length} UPS device(s) saved successfully` , devices: savedDevices });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on saving UPS.', err));
    }
}

exports.getAllDeviceUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await UPS.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all UPS.', err));
    }
}

exports.getAllDeviceUPSByBatchId = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await UPS.findAll({ where: { batch_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all UPS by batch id.', err));
    }
}

exports.getAllCondemnedDeviceUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawCondemnedUPS = await UPS.findAll({ where: { is_condemned: true } });

        res.status(200).json(allRawCondemnedUPS.map(ups => ups.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned UPS.', err));
    }
}

exports.getAllWorkingDeviceUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const allRawWorkingUPS = await UPS.findAll({ where: { is_condemned: false } });

        res.status(200).json(allRawWorkingUPS.map(ups => ups.get({ plain: true })));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching all condemned UPS.', err));
    }
}

exports.getDeviceUPSById = async (req, res, next) => {
    try {
        requestValidation(req, next); 

        const { id } = req.params;

        const ups = await UPS.findByPk(id, {
            attributes: {
                exclude: ['created_at']
            }
        });

        if (!ups) return next(createErrors.notFound("This UPS doesn't exists."));

        res.status(200).json(ups);
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching specific UPS.', err));
    }
}

exports.condemnedDeviceUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;
        const { reason, condemned_at } = req.body;

        const ups = await UPS.findByPk(id);
        if (!ups) return next(createErrors.notFound("This UPS doesn't exist."));

        await UPS.update({ is_condemned: true }, { where: { id } });
        await CondemnedUPS.create({ ups_id: id, reason, condemned_by: req.user.id, condemned_at });

        res.status(200).json({ code: 200, message: `${ups.device_number} condemned successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on updating status of UPS.', err));
    }
}

exports.putByIdDeviceUPS = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        requestValidation(req, next);

        const { id } = req.params;
        const {
            section_id, serial_number,
            volt_amperes, accountable_user, co_accountable_user
        } = req.body;

        const ups = await UPS.findByPk(id, { transaction: t });
        if (!ups) return next(createErrors.notFound("This UPS doesn't exists."));

        await UPS.update(
            { section_id, serial_number, volt_amperes, accountable_user, co_accountable_user },
            { where: { id }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ code: 200, message: 'UPS device updated successfully.' });
    } catch (err) {
        console.log(err);
        if (t) await t.rollback();
        next(createErrors.internalServerError('Something went wrong on updating specific UPS.', err));
    }
}

exports.deleteByIdDeviceUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        const ups = await UPS.findOne({ where: { id } });
        if (!ups) return next(createErrors.notFound("UPS device with this id doesn't exist."));

        await UPS.destroy({ where: { id } });

        res.status(200).json({ code: 200, message: `${ups.device_number} deleted successfully.` });
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on deleting specific UPS.', err));
    }
}

exports.getLocationAuditDeviceUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        const { id } = req.params;

        res.status(200).json(await AuditUPSLocation.findAll({ where: { ups_id: id } }));
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in specific UPS.', err));
    }
}

exports.getAllLocationAuditDeviceUPS = async (req, res, next) => {
    try {
        requestValidation(req, next);

        res.status(200).json(await AuditUPSLocation.findAll());
    } catch (err) {
        console.log(err);
        next(createErrors.internalServerError('Something went wrong on fetching of audit in all UPS.', err));
    }
}

exports.getFile = async (req, res, next) => {
    const { file_name } = req.params;

    const filePath = path.join(__dirname, '../dir', file_name);

    res.sendFile(filePath, (err) => {
        if (err) return next(createErrors.badRequest('There is no file found.'));
    }); 
}
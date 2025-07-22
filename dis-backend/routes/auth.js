const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const authenticateToken = require('../util/auth');

const router = express.Router();

router.post('/signup', [
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], authController.signup);

router.post('/login', authController.login);

router.get('/user', authenticateToken, authController.getUserById);

router.get('/user/recover', authController.recover);

router.post('/user/recover', authController.changePassword);

router.get('/division', authenticateToken, authController.getAllDivisions);

router.get('/section/division/:id', authenticateToken, authController.getSectionsByDivId);

router.get('/supplier', authenticateToken, authController.getAllSuppliers);

router.get('/supplier/:id', authenticateToken, authController.getByIdSupplier);

router.post('/supplier', [
    body('name').notEmpty().withMessage('Name is required.'),
    body('contact_number').isLength({ min: 11 }).withMessage('Please enter a valid contact number.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('cp_name').notEmpty().withMessage("Contact person's name is required."),
    body('cp_contact_number').notEmpty().withMessage("Contact person's number is required.")
], authenticateToken, authController.postSupplier);

router.put('/supplier/:id', [
    body('name').notEmpty().withMessage('Name is required.'),
    body('contact_number').isLength({ min: 11 }).withMessage('Please enter a valid contact number.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('cp_name').notEmpty().withMessage("Contact person's name is required."),
    body('cp_contact_number').notEmpty().withMessage("Contact person's number is required.")
], authenticateToken, authController.putByIdSupplier);

router.delete('/supplier/:id', authenticateToken, authController.deleteByIdSupplier);

router.get('/batch', authenticateToken, authController.getAllBatches);

router.get('/batch/:id', authenticateToken, authController.getByIdBatch);

router.post('/batch', authenticateToken, authController.postBatch);

router.put('/batch/:id', authenticateToken, authController.putByIdBatch);

router.delete('/batch/:id', authenticateToken, authController.deleteByIdBatch);

// ============= Brand =============
router.get('/brand/aio', authenticateToken, authController.getAllAIOBrands);

router.post('/brand/aio', authenticateToken, authController.postBrandAIO);

router.get('/brand/laptop', authenticateToken, authController.getAllLaptopBrands);

router.post('/brand/laptop', authenticateToken, authController.postBrandLaptop);

router.get('/brand/printer', authenticateToken, authController.getAllPrinterBrands);

router.post('/brand/printer', authenticateToken, authController.postBrandPrinter);

router.get('/brand/router', authenticateToken, authController.getAllRouterBrands);

router.post('/brand/router', authenticateToken, authController.postBrandRouter);

router.get('/brand/scanner', authenticateToken, authController.getAllScannerBrands);

router.post('/brand/scanner', authenticateToken, authController.postBrandScanner);

router.get('/brand/tablet', authenticateToken, authController.getAllTabletBrands);

router.post('/brand/tablet', authenticateToken, authController.postBrandTablet);

router.get('/brand/ups', authenticateToken, authController.getAllUPSBrands);

router.post('/brand/ups', authenticateToken, authController.postBrandUPS);

router.get('/brand/motherboard', authenticateToken, authController.getAllMotherboardBrands);

router.post('/brand/motherboard', authenticateToken, authController.postBrandMotherboard);

router.get('/brand/processor', authenticateToken, authController.getAllProcessorBrands);

router.post('/brand/processor', authenticateToken, authController.postBrandProcessor);

router.get('/brand/processor/:id/series', authenticateToken, authController.getAllProcessorSeriesById);

router.post('/brand/processor/:id/series', authenticateToken, authController.postBrandProcessorSeries);

router.get('/brand/chipset', authenticateToken, authController.getAllChipsetBrands);

router.post('/brand/chipset', authenticateToken, authController.postBrandChipset);

// ============= Miscellaneous =============
router.post('/misc/type/printer', authenticateToken, authController.postPrinterType);

router.get('/misc/type/printer', authenticateToken, authController.getAllPrinterTypes);

router.post('/misc/type/scanner', authenticateToken, authController.postScannerType);

router.get('/misc/type/scanner', authenticateToken, authController.getAllScannerTypes);

router.get('/misc/type/storage', authenticateToken, authController.getAllStorageTypes);

router.post('/misc/networkspeed', authenticateToken, authController.postNetworkSpeed);

router.get('/misc/networkspeed', authenticateToken, authController.getAllNetworkSpeeds);

router.post('/misc/antennacount', authenticateToken, authController.postAntennaCount);

router.get('/misc/antennacount', authenticateToken, authController.getAllAntennaCounts);

// ============= Services =============
router.post('/services/connection', authenticateToken, authController.postConnection);

router.get('/services/connection', authenticateToken, authController.getAllConnections);

router.post('/services/peripheral', authenticateToken, authController.postPeripheral);

router.get('/services/peripheral', authenticateToken, authController.getAllPeripherals);

router.post('/services/softwares/os', authenticateToken, authController.postSoftwareOS);

router.get('/services/softwares/os', authenticateToken, authController.getAllSoftwareOS);

router.post('/services/softwares/productivitytool', authenticateToken, authController.postSoftwareProductivityTool);

router.get('/services/softwares/productivitytool', authenticateToken, authController.getAllSoftwareProductivity);

router.post('/services/softwares/security', authenticateToken, authController.postSoftwareSecurity);

router.get('/services/softwares/security', authenticateToken, authController.getAllSoftwareSecurity);

// ============= Capacity =============
router.get('/capacity/ram', authenticateToken, authController.getAllRAM);

router.post('/capacity/ram', authenticateToken, authController.postRAM);

router.get('/capacity/storage', authenticateToken, authController.getAllStorage);

router.post('/capacity/storage', authenticateToken, authController.postStorage);

router.get('/capacity/gpu', authenticateToken, authController.getAllGPU);

router.post('/capacity/gpu', authenticateToken, authController.postGPU);

// ============= Part =============
router.post('/part/ram', authenticateToken, authController.postPartRAM);

router.get('/part/ram', authenticateToken, authController.getAllPartRAM);

router.get('/part/ram/:id', authenticateToken, authController.getByIdPartRAM);

router.put('/part/ram/:id', authenticateToken, authController.putByIdPartRAM);

router.post('/part/gpu', authenticateToken, authController.postPartGPU);

router.get('/part/gpu', authenticateToken, authController.getAllPartGPU);

router.get('/part/gpu/:id', authenticateToken, authController.getByIdPartGPU);

router.put('/part/gpu/:id', authenticateToken, authController.putByIdPartGPU);

router.post('/part/storage', authenticateToken, authController.postPartStorage);

router.get('/part/storage', authenticateToken, authController.getAllPartStorage);

router.get('/part/storage/:id', authenticateToken, authController.getByIdPartStorage);

router.put('/part/storage/:id', authenticateToken, authController.putByIdPartStorage);

router.post('/part/processor', authenticateToken, authController.postPartProcessor);

router.get('/part/processor', authenticateToken, authController.getAllPartProcessor);

router.get('/part/processor/:id', authenticateToken, authController.getByIdPartProcessor);

router.put('/part/processor/:id', authenticateToken, authController.putByIdPartProcessor);

router.post('/part/motherboard', authenticateToken, authController.postPartMotherboard);

router.get('/part/motherboard', authenticateToken, authController.getAllPartMotherboard);

router.get('/part/motherboard/:id', authenticateToken, authController.getByIdPartMotherboard);

router.put('/part/motherboard/:id', authenticateToken, authController.putByIdPartMotherboard);

router.post('/part/chipset', authenticateToken, authController.postPartChipset);

router.get('/part/chipset', authenticateToken, authController.getAllPartChipset);

router.get('/part/chipset/:id', authenticateToken, authController.getByIdPartChipset);

router.put('/part/chipset/:id', authenticateToken, authController.putByIdPartChipset);

// ============= AIO =============
router.post('/device/aio', authenticateToken, authController.postDeviceAIO);

router.get('/device/aio', authenticateToken, authController.getAllDeviceAIO);

router.get('/device/aio/condemned', authenticateToken, authController.getAllCondemnedDeviceAIO);

router.get('/device/aio/working', authenticateToken, authController.getAllWorkingDeviceAIO);

router.get('/device/aio/:id', authenticateToken, authController.getDeviceAIOById);

router.patch('/device/aio/:id', authenticateToken, authController.condemnedDeviceAIO);

router.put('/device/aio/:id', authenticateToken, authController.putByIdDeviceAIO);

router.get('/device/aio/:id/audit/connection', authenticateToken, authController.getConnectionAuditDeviceAIO);

router.get('/device/aio/:id/audit/location', authenticateToken, authController.getLocationAuditDeviceAIO);

router.get('/device/aio/audit/connection', authenticateToken, authController.getAllConnectionAuditDeviceAIO);

router.get('/device/aio/audit/location', authenticateToken, authController.getAllLocationAuditDeviceAIO);

// ============= Laptop =============
router.post('/device/laptop', authenticateToken, authController.postDeviceLaptop);

router.get('/device/laptop', authenticateToken, authController.getAllDeviceLaptop);

router.get('/device/laptop/condemned', authenticateToken, authController.getAllCondemnedDeviceLaptop);

router.get('/device/laptop/working', authenticateToken, authController.getAllWorkingDeviceLaptop);

router.get('/device/laptop/:id', authenticateToken, authController.getDeviceLaptopById);

router.patch('/device/laptop/:id', authenticateToken, authController.condemnedDeviceLaptop);

router.put('/device/laptop/:id', authenticateToken, authController.putByIdDeviceLaptop);

router.get('/device/laptop/:id/audit/connection', authenticateToken, authController.getConnectionAuditDeviceLaptop);

router.get('/device/laptop/:id/audit/location', authenticateToken, authController.getLocationAuditDeviceLaptop);

router.get('/device/laptop/audit/connection', authenticateToken, authController.getAllConnectionAuditDeviceLaptop);

router.get('/device/laptop/audit/location', authenticateToken, authController.getAllLocationAuditDeviceLaptop);

// ============= Computer =============
router.post('/device/computer', authenticateToken, authController.postDeviceComputer);

router.get('/device/computer', authenticateToken, authController.getAllDeviceComputer);

router.get('/device/computer/condemned', authenticateToken, authController.getAllCondemnedDeviceComputer);

router.get('/device/computer/working', authenticateToken, authController.getAllWorkingDeviceComputer);

router.get('/device/computer/:id', authenticateToken, authController.getDeviceComputerById);

router.patch('/device/computer/:id', authenticateToken, authController.condemnedDeviceComputer);

router.put('/device/computer/:id', authenticateToken, authController.putByIdDeviceComputer);

router.get('/device/computer/:id/audit/connection', authenticateToken, authController.getConnectionAuditDeviceComputer);

router.get('/device/computer/:id/audit/location', authenticateToken, authController.getLocationAuditDeviceComputer);

router.get('/device/computer/audit/connection', authenticateToken, authController.getAllConnectionAuditDeviceComputer);

router.get('/device/computer/audit/location', authenticateToken, authController.getAllLocationAuditDeviceComputer);

// ============= Tablet =============
router.post('/device/tablet', authenticateToken, authController.postDeviceTablet);

router.get('/device/tablet', authenticateToken, authController.getAllDeviceTablet);

router.get('/device/tablet/condemned', authenticateToken, authController.getAllCondemnedDeviceTablet);

router.get('/device/tablet/working', authenticateToken, authController.getAllWorkingDeviceTablet);

router.get('/device/tablet/:id', authenticateToken, authController.getDeviceTabletById);

router.patch('/device/tablet/:id', authenticateToken, authController.condemnedDeviceTablet);

router.put('/device/tablet/:id', authenticateToken, authController.putByIdDeviceTablet);

router.get('/device/tablet/:id/audit/connection', authenticateToken, authController.getConnectionAuditDeviceTablet);

router.get('/device/tablet/:id/audit/location', authenticateToken, authController.getLocationAuditDeviceTablet);

router.get('/device/tablet/audit/connection', authenticateToken, authController.getAllConnectionAuditDeviceTablet);

router.get('/device/tablet/audit/location', authenticateToken, authController.getAllLocationAuditDeviceTablet);

// ============= Router =============
router.post('/device/router', authenticateToken, authController.postDeviceRouter);

router.get('/device/router', authenticateToken, authController.getAllDeviceRouter);

router.get('/device/router/condemned', authenticateToken, authController.getAllCondemnedDeviceRouter);

router.get('/device/router/working', authenticateToken, authController.getAllWorkingDeviceRouter);

router.get('/device/router/:id', authenticateToken, authController.getDeviceRouterById);

router.patch('/device/router/:id', authenticateToken, authController.condemnedDeviceRouter);

router.put('/device/router/:id', authenticateToken, authController.putByIdDeviceRouter);

router.get('/device/router/:id/audit/location', authenticateToken, authController.getLocationAuditDeviceRouter);

router.get('/device/router/audit/location', authenticateToken, authController.getAllLocationAuditDeviceRouter);

// ============= Printer =============
router.post('/device/printer', authenticateToken, authController.postDevicePrinter);

router.get('/device/printer', authenticateToken, authController.getAllDevicePrinter);

router.get('/device/printer/condemned', authenticateToken, authController.getAllCondemnedDevicePrinter);

router.get('/device/printer/working', authenticateToken, authController.getAllWorkingDevicePrinter);

router.get('/device/printer/:id', authenticateToken, authController.getDevicePrinterById);

router.patch('/device/printer/:id', authenticateToken, authController.condemnedDevicePrinter);

router.put('/device/printer/:id', authenticateToken, authController.putByIdDevicePrinter);

router.get('/device/printer/:id/audit/location', authenticateToken, authController.getLocationAuditDevicePrinter);

router.get('/device/printer/audit/location', authenticateToken, authController.getAllLocationAuditDevicePrinter);

// ============= Scanner =============
router.post('/device/scanner', authenticateToken, authController.postDeviceScanner);

router.get('/device/scanner', authenticateToken, authController.getAllDeviceScanner);

router.get('/device/scanner/condemned', authenticateToken, authController.getAllCondemnedDeviceScanner);

router.get('/device/scanner/working', authenticateToken, authController.getAllWorkingDeviceScanner);

router.get('/device/scanner/:id', authenticateToken, authController.getDeviceScannerById);

router.patch('/device/scanner/:id', authenticateToken, authController.condemnedDeviceScanner);

router.put('/device/scanner/:id', authenticateToken, authController.putByIdDeviceScanner);

router.get('/device/scanner/:id/audit/location', authenticateToken, authController.getLocationAuditDeviceScanner);

router.get('/device/scanner/audit/location', authenticateToken, authController.getAllLocationAuditDeviceScanner);

// ============= UPS =============
router.post('/device/ups', authenticateToken, authController.postDeviceUPS);

router.get('/device/ups', authenticateToken, authController.getAllDeviceUPS);

router.get('/device/ups/condemned', authenticateToken, authController.getAllCondemnedDeviceUPS);

router.get('/device/ups/working', authenticateToken, authController.getAllWorkingDeviceUPS);

router.get('/device/ups/:id', authenticateToken, authController.getDeviceUPSById);

router.patch('/device/ups/:id', authenticateToken, authController.condemnedDeviceUPS);

router.put('/device/ups/:id', authenticateToken, authController.putByIdDeviceUPS);

router.get('/device/ups/:id/audit/location', authenticateToken, authController.getLocationAuditDeviceUPS);

router.get('/device/ups/audit/location', authenticateToken, authController.getAllLocationAuditDeviceUPS);

module.exports = router;
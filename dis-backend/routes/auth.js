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

router.get('/user/recover', authController.recover);

router.post('/user/recover', authController.changePassword);

router.get('/divisions', authenticateToken, authController.getAllDivisions);

router.get('/division', authenticateToken, authController.getDivisionById);

router.get('/section/division', authenticateToken, authController.getSectionsByDivId);

router.get('/suppliers', authenticateToken, authController.getAllSuppliers);

router.get('/supplier', authenticateToken, authController.getSupplierById);

router.post('/supplier', [
    body('name').notEmpty().withMessage('Name is required.'),
    body('contact_number').isLength({ min: 11 }).withMessage('Please enter a valid contact number.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('cp_name').notEmpty().withMessage("Contact person's name is required."),
    body('cp_contact_number').notEmpty().withMessage("Contact person's number is required.")
], authenticateToken, authController.postSupplier);

router.patch('/supplier', authenticateToken, authController.editSupplier);

router.delete('/supplier', authenticateToken, authController.deleteSupplier);

router.get('/batches', authenticateToken, authController.getAllBatches);

router.get('/batch', authenticateToken, authController.getBatchById);

router.post('/batch', authenticateToken, authController.postBatch);

router.patch('/batch', authenticateToken, authController.editBatch);

router.delete('/batch', authenticateToken, authController.deleteBatch);

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

router.get('/brand/chipset', authenticateToken, authController.getAllChipsetBrands);

router.post('/brand/chipset', authenticateToken, authController.postBrandChipset);

router.post('/misc/type/printer', authenticateToken, authController.postPrinterType);

router.get('/misc/type/printer', authenticateToken, authController.getAllPrinterTypes);

router.post('/misc/type/scanner', authenticateToken, authController.postScannerType);

router.get('/misc/type/scanner', authenticateToken, authController.getAllScannerTypes);

router.get('/misc/type/storage', authenticateToken, authController.getAllStorageTypes);

router.post('/misc/networkspeed', authenticateToken, authController.postNetworkSpeed);

router.get('/misc/networkspeed', authenticateToken, authController.getAllNetworkSpeeds);

router.post('/misc/antennacount', authenticateToken, authController.postAntennaCount);

router.get('/misc/antennacount', authenticateToken, authController.getAllAntennaCounts);

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

router.get('/capacity/ram', authenticateToken, authController.getAllRAM);

router.post('/capacity/ram', authenticateToken, authController.postRAM);

router.get('/capacity/storage', authenticateToken, authController.getAllStorage);

router.post('/capacity/storage', authenticateToken, authController.postStorage);

router.get('/capacity/gpu', authenticateToken, authController.getAllGPU);

router.post('/capacity/gpu', authenticateToken, authController.postGPU);

module.exports = router;
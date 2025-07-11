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

router.post('/device/aio', authenticateToken, authController.postDeviceAIO);

router.get('/device/aio', authenticateToken, authController.getAllDeviceAIO);

router.get('/device/aio/condemned', authenticateToken, authController.getAllCondemnedDeviceAIO);

router.get('/device/aio/working', authenticateToken, authController.getAllWorkingDeviceAIO);

router.get('/device/aio/:id', authenticateToken, authController.getDeviceAIOById);

router.patch('/device/aio/:id', authenticateToken, authController.condemnedDeviceAIO);

router.put('/device/aio/:id', authenticateToken, authController.putByIdDeviceAIO);

router.get('/device/aio/audit/connection/:id', authenticateToken, authController.getConnectionAuditDeviceAIO);

router.get('/device/aio/audit/location/:id', authenticateToken, authController.getLocationAuditDeviceAIO);

router.post('/device/laptop', authenticateToken, authController.postDeviceLaptop);

router.get('/device/laptop', authenticateToken, authController.getAllDeviceLaptop);

router.get('/device/laptop/condemned', authenticateToken, authController.getAllCondemnedDeviceLaptop);

router.get('/device/laptop/working', authenticateToken, authController.getAllWorkingDeviceLaptop);

module.exports = router;
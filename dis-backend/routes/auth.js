const express = require('express');

const authController = require('../controllers/auth');
const authenticateToken = require('../util/auth');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/user/recover', authController.recover);

router.post('/user/recover', authController.changePassword);

router.get('/divisions', authController.getAllDivisions);

router.get('/division', authController.getDivisionById);

router.get('/section/division', authController.getSectionsByDivId);

router.get('/suppliers', authController.getAllSuppliers);

router.get('/supplier', authController.getSupplierById);

router.post('/supplier', authController.postSupplier);

router.get('/batch/all', authController.getAllBatches);

router.post('/batch', authController.postBatch);

module.exports = router;
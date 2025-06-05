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

router.get('/divisions', authController.getAllDivisions);

router.get('/division', authController.getDivisionById);

router.get('/section/division', authController.getSectionsByDivId);

router.get('/suppliers', authController.getAllSuppliers);

router.get('/supplier', authController.getSupplierById);

router.post('/supplier', authController.postSupplier);

router.patch('/supplier', authController.editSupplier);

router.delete('/supplier', authController.deleteSupplier);

router.get('/batches', authController.getAllBatches);


router.post('/batch', authController.postBatch);

module.exports = router;
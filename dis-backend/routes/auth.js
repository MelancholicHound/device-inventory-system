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

module.exports = router;
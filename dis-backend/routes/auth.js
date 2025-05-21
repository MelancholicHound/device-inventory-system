const express = require('express');

const authController = require('../controllers/auth');
const authenticateToken = require('../util/auth');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/division', authController.getAllDivisions);

router.get('/section', authController.getSectionByDiv);

router.get('/user/recover', authController.recover);

router.post('/user/recover', authController.changePassword);

router.get('/batch/all', authenticateToken, authController.getAllBatches);

router.post('/batch', authenticateToken, authController.saveBatch);

module.exports = router;
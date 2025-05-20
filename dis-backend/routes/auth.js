const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/division', authController.getAllDivisions);

router.get('/section', authController.getSectionByDiv);

router.get('/user/recover', authController.recover);

router.post('/user/recover', authController.changePassword);

module.exports = router;
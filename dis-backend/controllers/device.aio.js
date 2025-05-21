const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const { createErrors } = require('../controllers/error');

exports.getAllBrands = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return next(createErrors.unprocessableEntity('Validation failed: ', error.array()));
        }

        
    } catch (err) {
        
    }
}
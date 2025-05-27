const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const Batch = require('./batch/Batch')(sequelize, DataTypes);
const Brand = require('./brand/Brand')(sequelize, DataTypes);
const User = require('./user/User')(sequelize, DataTypes);

const models = {
    sequelize,
    ...Batch,
    ...Brand,
    ...User
};

module.exports = models;
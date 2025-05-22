const { Sequelize, DataTypes } = require('sequelize');

const { Batch, Section } = require('../util/database.user');
const { BrandUPS } = require('../util/database.brands');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const UPS = sequelize.define('tbl_device_ups', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Batch,
            key: 'id'
        }
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Section,
            key: 'id'
        }
    },
    serial_number: {
        type: DataTypes.STRING
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: BrandUPS,
            key: 'id'
        }
    },
    model: {
        type: DataTypes.STRING
    },
    kilo_volts: {
        type: DataTypes.INTEGER
    }
});

sequelize.sync({ alter: true })
.catch((error) => console.log('Error creating table: ', error));

module.exports = {
    UPS
};
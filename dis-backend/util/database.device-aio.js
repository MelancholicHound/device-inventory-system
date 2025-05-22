const { Sequelize, DataTypes } = require('sequelize');

const { Section, Batch } = require('../util/database.user');
const { UPS } = require('../util/database.device-ups');
const { BrandAIO } = require('../util/database.brands');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const AIO = sequelize.define('tbl_device_aio', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    batch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    ups_id: {
        type: DataTypes.INTEGER,
        references: {
            model: UPS,
            key: 'id'
        }
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: BrandAIO,
            key: 'id'
        }
    },
    serial_number: {
        type: DataTypes.STRING,
        unique: true
    }
});

sequelize.sync({ alter: true })
.catch((error) => console.log('Error creating table: ', error));

module.exports = {
    AIO
}
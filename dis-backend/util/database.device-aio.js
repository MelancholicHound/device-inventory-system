const { Sequelize, DataTypes } = require('sequelize');

const { Section, Batch } = require('../util/database.user');
const { UPS } = require('../util/database.device-ups');
const { RAM, Storage } = require('../util/database.capacities');
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
    device_tag: {
        type: DataTypes.STRING,
        allowNull: false
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Section,
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
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serial_number: {
        type: DataTypes.STRING,
        unique: true
    },
    ups_id: {
        type: DataTypes.INTEGER,
        references: {
            model: UPS,
            key: 'id'
        }
    }
});

const RAMAIO = sequelize.define('tbl_ram_aio', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AIO,
            key: 'id'
        }
    },
    aio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RAM,
            key: 'id'
        }
    }
});

const StorageAIO = sequelize.define('tbl_storage_aio', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AIO,
            key: 'id'
        }
    },
    storage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Storage,
            key: 'id'
        }
    }
});

sequelize.sync({ alter: true })
.catch((error) => console.log('Error creating table: ', error));

module.exports = {
    RAMAIO,
    StorageAIO,
    AIO
}
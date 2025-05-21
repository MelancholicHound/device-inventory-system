const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const RAMQuantity = sequelize.define('tbl_cap_ram', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const StorageType = sequelize.define('tbl_cap_storage_type', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const StorageQuantity = sequelize.define('tbl_cap_storage_qty', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const Storage = sequelize.define('tbl_cap_storage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    storage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: StorageQuantity,
            key: 'id'
        }
    },
    type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: StorageType,
            key: 'id'
        }
    }
});

sequelize.sync({ alter: true })
.then(async () => {
    const countRAM = await RAMQuantity.count();
    const countStorage = await StorageQuantity.count();
    const countType = await StorageType.count();

    if (countRAM == 0) {
        await RAMQuantity.bulkCreate([
            { capacity: 2 }, { capacity: 4 }, { capacity: 8 }, { capacity: 16 }
        ]);
    }

    if (countStorage == 0) {
        await StorageQuantity.bulkCreate([
            { capacity: 64 }, { capacity: 128 }, { capacity: 256 }, { capacity: 512 } 
        ]);
    }

    if (countType == 0) {
        await StorageType.bulkCreate([
            { type: 'HDD' }, { type: 'SSD' }
        ]);
    }
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { RAMQuantity, StorageQuantity, StorageType, Storage };
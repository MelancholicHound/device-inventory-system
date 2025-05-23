const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const RAMQuantity = sequelize.define('tbl_cap_ram_qty', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const StorageQuantity = sequelize.define('tbl_cap_storage_qty', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const GPUQuantity = sequelize.define('tbl_cap_gpu_qty', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const StorageType = sequelize.define('tbl_cap_storage_type', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
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
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const RAM = sequelize.define('tbl_cap_ram', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ram_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RAMQuantity,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

sequelize.sync({ alter: true })
.then(async () => {
    const countRAM = await RAMQuantity.count();
    const countStorage = await StorageQuantity.count();
    const countGPU = await GPUQuantity.count();
    const countType = await StorageType.count();

    const capacityData = [
        { count: countRAM, model: RAMQuantity, capacities: [2, 4, 8, 16] },
        { count: countStorage, model: StorageQuantity, capacities: [64, 128, 256, 512] },
        { count: countGPU, model: GPUQuantity, capacities: [2, 4, 6, 8] }
    ];

    for (const { count, model, capacities } of capacityData) {
        if (count === 0) {
            const capacityObjects = capacities.map(capacity => ({ capacity }));
            await model.bulkCreate(capacityObjects);
        }
    }

    if (countType === 0) {
        await StorageType.bulkCreate([
            { type: 'HDD' }, { type: 'SSD' }
        ]);
    }
    
    console.log('Table created successfully.');
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { 
    RAMQuantity, 
    StorageQuantity,
    GPUQuantity, 
    StorageType, 
    Storage, 
    RAM
};
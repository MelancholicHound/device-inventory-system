const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const ProcessorBrand = sequelize.define('tbl_part_processor_brand', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const ProcessorSeries = sequelize.define('tbl_part_processor_series', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            model: ProcessorBrand,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Processor = sequelize.define('tbl_part_processor', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    series_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ProcessorSeries,
            key: 'id'
        }
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const MotherboardBrand = sequelize.define('tbl_part_motherboard_brand', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Motherboard = sequelize.define('tbl_part_motherboard', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MotherboardBrand,
            key: 'id'
        }
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const ChipsetBrand = sequelize.define('tbl_part_chipset_brand', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Chipset = sequelize.define('tbl_part_chipset', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ChipsetBrand,
            key: 'id'
        }
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const PrinterType = sequelize.define('tbl_part_printer_type', {
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
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const ScannerType = sequelize.define('tbl_part_scanner_type', {
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

const NetworkSpeed = sequelize.define('tbl_part_router_speed', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    speed_by_mbps: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const AntennaCount = sequelize.define('tbl_part_router_antenna', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true
    },
    antenna_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

sequelize.sync({ alter: true })
.then(async () => {
    const countProcBrand = await ProcessorBrand.count();
    const countProcSeries = await ProcessorSeries.count();
    const countMoboBrand = await MotherboardBrand.count();
    const countChipBrand = await ChipsetBrand.count();
    const countPrintType = await PrinterType.count();
    const countScanType = await ScannerType.count();
    const countNetSpeed = await NetworkSpeed.count();
    const countAntenna = await AntennaCount.count();

    const brandData = [
        { count: countProcBrand, model: ProcessorBrand, names: ['Intel', 'AMD'] },
        { count: countMoboBrand, model: MotherboardBrand, names: ['Gigabyte', 'Asus'] },
        { count: countChipBrand, model: ChipsetBrand, names: ['Snapdragon', 'Mediatek'] }
    ];

    for (const { count, model, names } of brandData) {
        if (count === 0) {
            const nameObjects = names.map(name => ({ name }));
            await model.bulkCreate(nameObjects);
        }
    }

    const typeData = [
        { count: countPrintType, model: PrinterType, type: ['CISS', 'Dot Matrix', 'Ink Jet', 'Laser'] },
        { count: countScanType, model: ScannerType, type: ['Flatbed', 'Sheetfed', 'Photoscanner'] }
    ];

    for (const { count, model, types } of typeData) {
        if (count === 0) {
            const typeObjects = types.map(type => ({ type }));
            await model.bulkCreate(typeObjects);
        }
    }

    if (countNetSpeed === 0) {
        await NetworkSpeed.bulkCreate([
            { speed: 50 }, { speed: 100 }, { speed: 250 }
        ]);
    }

    if (countAntenna === 0) {
        await AntennaCount.bulkCreate([
            { antenna_count: 2 }, { antenna_count: 4 }, { antenna_count: 6 }
        ]);
    }

    const intel = await ProcessorBrand.findOne({ where: { name: 'Intel' } });
    const amd = await ProcessorBrand.findOne({ where: { name: 'AMD' } });

    if (countProcSeries === 0) {
        await ProcessorSeries.bulkCreate([
            { name: 'Core', brand_id: intel.dataValues?.id },
            { name: 'Pentium', brand_id: intel.dataValues?.id },
            { name: 'Ryzen', brand_id:  amd.dataValues?.id },
            { name: 'Athlon', brand_id: amd.dataValues?.id }
        ]);
    }

    console.log('Table created successfully.');
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { 
    ProcessorBrand, 
    ProcessorSeries, 
    MotherboardBrand,
    ChipsetBrand, 
    Processor, 
    Motherboard,
    Chipset,
    PrinterType,
    ScannerType,
    NetworkSpeed,
    AntennaCount
};

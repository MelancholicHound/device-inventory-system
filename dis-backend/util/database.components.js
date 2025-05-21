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
        allowNull: false
    }
});

const ProcessorSeries = sequelize.define('tbl_part_processor_series', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            model: ProcessorBrand,
            key: 'id'
        }
    }
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
});

const MotherboardBrand = sequelize.define('tbl_part_motherboard_brand', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
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
});

sequelize.sync({ alter: true })
.then(async () => {
    const countProcBrand = await ProcessorBrand.count();
    const countProcSeries = await ProcessorSeries.count();
    const countMoboBrand = await MotherboardBrand.count();

    if (countProcBrand == 0) {
        await ProcessorBrand.bulkCreate([
            { name: 'Intel' }, { name: 'AMD' }
        ]);
    }

    const intel = await ProcessorBrand.findOne({ where: { name: 'Intel' } });
    const amd = await ProcessorBrand.findOne({ where: { name: 'AMD' } });

    if (countProcSeries == 0) {
        await ProcessorSeries.bulkCreate([
            { name: 'Core', brand_id: intel.dataValues?.id },
            { name: 'Pentium', brand_id: intel.dataValues?.id },
            { name: 'Ryzen', brand_id:  amd.dataValues?.id },
            { name: 'Athlon', brand_id: amd.dataValues?.id }
        ]);
    }

    if (countMoboBrand == 0) {
        await MotherboardBrand.bulkCreate([
            { name: 'Gigabyte' }, { name: 'Asus' }
        ]);
    }
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { ProcessorBrand, ProcessorSeries, MotherboardBrand, Processor, Motherboard };

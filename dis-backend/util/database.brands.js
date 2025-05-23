const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const BrandAIO = sequelize.define('tbl_brand_aio', {
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

const BrandLaptop = sequelize.define('tbl_brand_laptop', {
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

const BrandTablet = sequelize.define('tbl_brand_tablet', {
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

const BrandPrinter = sequelize.define('tbl_brand_printer', {
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

const BrandScanner = sequelize.define('tbl_brand_scanner', {
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

const BrandRouter = sequelize.define('tbl_brand_router', {
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

const BrandUPS = sequelize.define('tbl_brand_ups', {
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

sequelize.sync({ alter: true })
.then(async () => {
    const countAIO = await BrandAIO.count();
    const countLaptop = await BrandLaptop.count();
    const countPrinter = await BrandPrinter.count();
    const countRouter = await BrandRouter.count();
    const countScanner = await BrandScanner.count();
    const countTablet = await BrandTablet.count();
    const countUPS = await BrandUPS.count();

    const brandData = [
        { count: countAIO, model: BrandAIO, names: ['Dell', 'Acer', 'AOC'] },
        { count: countLaptop, model: BrandLaptop, names: ['Acer', 'Lenovo', 'HP'] },
        { count: countPrinter, model: BrandPrinter, names: ['Epson', 'Canon', 'Brother'] },
        { count: countRouter, model: BrandRouter, names: ['TP-Link', 'Asus', 'Tenda'] },
        { count: countScanner, model: BrandScanner, names: ['Panasonic', 'Canon', 'Epson'] },
        { count: countTablet, model: BrandTablet, names: ['Samsung', 'Apple', 'Xiaomi'] },
        { count: countUPS, model: BrandUPS, names: ['Eaton', 'Toshiba', 'Emerson'] }
    ];

    for (const { count, model, names } of brandData) {
        if (count === 0) {
            const brandObjects = names.map(name => ({ name }));
            await model.bulkCreate(brandObjects);
        }
    }

    console.log('Table created successfully.');
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { 
    BrandAIO, 
    BrandLaptop, 
    BrandPrinter, 
    BrandRouter, 
    BrandScanner, 
    BrandTablet,
    BrandUPS
};
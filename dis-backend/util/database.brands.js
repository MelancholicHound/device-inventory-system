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
        allowNull: false
    }
});

const BrandLaptop = sequelize.define('tbl_brand_laptop', {
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

const BrandTablet = sequelize.define('tbl_brand_tablet', {
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

const BrandPrinter = sequelize.define('tbl_brand_printer', {
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

const BrandScanner = sequelize.define('tbl_brand_scanner', {
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

const BrandRouter = sequelize.define('tbl_brand_router', {
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

sequelize.sync({ alter: true })
.then(async () => {
    const countAIO = await BrandAIO.count();
    const countLaptop = await BrandLaptop.count();
    const countPrinter = await BrandPrinter.count();
    const countRouter = await BrandRouter.count();
    const countScanner = await BrandScanner.count();
    const countTablet = await BrandTablet.count();

    if (countAIO == 0) {
        await BrandAIO.bulkCreate([
            { name: 'Dell' }, { name: 'Acer' }, { name: 'AOC' }
        ]);
    }

    if (countLaptop == 0) {
        await BrandLaptop.bulkCreate([
            { name: 'Acer' }, { name: 'Lenovo' }, { name: 'HP' }
        ]);
    }

    if (countPrinter == 0) {
        await BrandPrinter.bulkCreate([
            { name: 'Epson' }, { name: 'Canon' }, { name: 'Brother' }
        ]);
    }

    if (countRouter == 0) {
        await BrandRouter.bulkCreate([
            { name: 'TP-Link' }, { name: 'Asus' }, { name: 'Tenda' }
        ]);
    }

    if (countScanner == 0) {
        await BrandScanner.bulkCreate([
            { name: 'Panasonic' }, { name: 'Canon' }, { name: 'Epson' }
        ]);
    }

    if (countTablet == 0) {
        await BrandTablet.bulkCreate([
            { name: 'Samsung' }, { name: 'Apple' }, { name: 'Xiaomi' }
        ]);
    }
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { BrandAIO, BrandLaptop, BrandPrinter, BrandRouter, BrandScanner, BrandTablet };
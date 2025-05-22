const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const ConnectionsDTO = sequelize.define('tbl_connections', {
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
});

const OperatingSystemDTO = sequelize.define('tbl_software_os', {
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
});

const Security = sequelize.define('tbl_software_security', {
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
});

const ProductivityTool = sequelize.define('tbl_software_prodtool', {
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
});

const PeripheralsDTO = sequelize.define('tbl_peripherals', {
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
});

sequelize.sync({ alter: true })
.then(async () => {
    const countConnections = await Connections.count();
    const countOS = await OperatingSystem.count();
    const countSecurity = await Security.count();
    const countProdTool = await ProductivityTool.count();
    const countPeripheral = await PeripheralsDTO.count();

    const serviceData = [
        { count: countOS, model: OperatingSystem, name: ['Windows - 10', 'Windows - 11', 'Linux - Ubuntu', 'Linux - Debian'] },
        { count: countSecurity, model: Security, name: ['Norton', 'Kaspersky', 'McAfee', 'Avast'] },
        { count: countProdTool, model: ProductivityTool, name: ['WPS Office', 'Microsoft Office'] },
    ];

    for (const { count, model, names } of serviceData) {
        if (count === 0) {
            const nameObjects = names.map(name => ({ name }));
            await model.bulkCreate(nameObjects);
        }
    }

    if (countConnections === 0) {
        await Connections.bulkCreate([
            { name: 'Internet' }, { name: 'HIS' }, { name: 'MMS' }, { name: 'PIS' }, { name: 'MLIS' },
            { name: 'LIS' }, { name: 'EHR' }, { name: 'eRNet' }, { name: 'ENGAS' }, { name: 'HRIPS' },
            { name: 'PACS with RIS' }, { name: 'Connected to equipment' }
        ]);
    }

    if (countPeripheral === 0) {
        await PeripheralsDTO.bulkCreate([
            { name: 'Wireless Mouse' }, { name: 'Wireless Keyboard' }, { name: 'Wired Mouse' }, { name: 'Wired Keyboard' }, { name: 'Speaker' },
            { name: 'Headset' }, { name: 'Earphone' }, { name: 'Monitor' }, { name: 'E-Pen' }, { name: 'Charger' }, { name: 'Webcam' },
            { name: 'Bluetooth Dongle' }, { name: 'Power Cable' }
        ]);
    }
})
.catch((error) => console.log('Error on creating table: ', error));

module.exports = {
    Connections,
    OperatingSystem,
    Security,
    ProductivityTool,
    PeripheralsDTO
};
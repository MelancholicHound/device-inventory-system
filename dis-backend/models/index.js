const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const models = { };

const loadModels = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadModels(fullPath);
        } else if (file.endsWith('.model.js')) {
            const defineModel = require(fullPath);
            const model = defineModel(sequelize, DataTypes);

            models[model.name] = model;
        }
    });
}

loadModels(__dirname);

const initDB = async() => {
    try {
        await sequelize.sync({ alter: true });

        console.log('Tables synced');
    } catch (error) {
        console.error('Unable to connect to the database: ', error);
    }
}

module.exports = { ...models, sequelize, Sequelize, initDB }
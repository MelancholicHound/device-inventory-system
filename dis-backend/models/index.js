const { Sequelize, DataTypes, Model } = require('sequelize');
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
            const define = require(fullPath);
            const result = define(sequelize, DataTypes);

            if (!result) {
                console.warn(`No model(s) returned from ${fullPath}`);
                return;
            }

            if (result instanceof Model || typeof result === 'function') {
                const name = result.name || result.modelName;
                models[name] = result;
            } else if (typeof result === 'object') {
                for (const [key, model] of Object.entries(result)) {
                    if (model.prototype instanceof Model) {
                        const name = model.name || model.modelName || key;
                        models[name] = model;
                    } else {
                        console.warn(`Skipping invalid model ${key} in ${fullPath}`);
                    }
                }
            }
        }
    });
}

loadModels(__dirname);

const initDB = async() => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        await sequelize.sync({ alter: true });
        console.log('Tables synced');
     

        await seedData(models);
    } catch (error) {
        console.error('Unable to connect to the database: ', error);
    }
}

const seedData = async(models) => {
     
}

module.exports = { ...models, sequelize, Sequelize, initDB }
const { Sequelize, DataTypes, Model } = require('sequelize');
const fs = require('fs');
const path = require('path');
const seederPath = require('../models/seeder');

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

            if (typeof result === 'object') {
                for (const [key, model] of Object.entries(result)) {
                    if (model.prototype instanceof Model) {
                        models[key] = model;
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
    const {
        User, Batch, Supplier, PurchaseRequestDTO, Division, Section,
        BrandProcessor, BrandSeriesProcessor, BrandMotherboard, BrandChipset,
        CapacityGPU, CapacityRAM, CapacityStorage,
        PartGPU, PartRAM, PartStorage, PartProcessor, PartMotherboard, PartChipset,
        StorageType,
        
    } = models;

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        await sequelize.sync({ alter: true });
        console.log('Tables synced.');
 
        CapacityRAM.hasMany(PartRAM, { foreignKey: 'ram_id', as: 'ramCapacity' });
        PartRAM.belongsTo(CapacityRAM, { foreignKey: 'ram_id', as: 'ramParts' });

        CapacityGPU.hasMany(PartGPU, { foreignKey: 'gpu_id', as: 'gpuCapacity' });
        PartGPU.belongsTo(CapacityGPU, { foreignKey: 'gpu_id', as: 'gpuParts' });
        
        CapacityStorage.hasMany(PartStorage, { foreignKey: 'storage_id', as: 'storageCapacity' });
        PartStorage.belongsTo(StorageType, { foreignKey: 'type_id', as: 'storageType' });
        PartStorage.belongsTo(CapacityStorage, { foreignKey: 'storage_id', as: 'storageParts' });

        BrandProcessor.hasMany(BrandSeriesProcessor, { foreignKey: 'brand_id', as: 'procSeries' });
        BrandSeriesProcessor.belongsTo(BrandProcessor, { foreignKey: 'brand_id', as: 'procBrand' });

        BrandSeriesProcessor.hasMany(PartProcessor, { foreignKey: 'series_id', as: 'processors' });
        PartProcessor.belongsTo(BrandSeriesProcessor, { foreignKey: 'series_id', as: 'procSeries' });

        BrandMotherboard.hasMany(PartMotherboard, { foreignKey: 'brand_id', as: 'moboBrand' });
        PartMotherboard.belongsTo(BrandMotherboard, { foreignKey: 'brand_id', as: 'moboParts' });

        BrandChipset.hasMany(PartChipset, { foreignKey: 'brand_id', as: 'chipsetBrand' });
        PartChipset.belongsTo(BrandChipset, { foreignKey: 'brand_id', as: 'chipsetParts' });

        Batch.belongsTo(PurchaseRequestDTO, { foreignKey: 'prDTO_id', as: 'purchaseRequest' });
        PurchaseRequestDTO.hasMany(Batch, { foreignKey: 'prDTO_id', as: 'batches' });

        Batch.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
        Supplier.hasMany(Batch, { foreignKey: 'supplier_id', as: 'batches' });

        Batch.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
        User.hasMany(Batch, { foreignKey: 'created_by', as: 'createdBatches' });

        Section.belongsTo(Division, { foreignKey: 'div_id', as: 'division' });
        Division.hasMany(Section, { foreignKey: 'div_id', as: 'sections' });
        console.log('Tables associated.');



        await seederPath(models);
        console.log('Values inserted.');
    } catch (error) {
        console.error('Unable to connect to the database: ', error);
    }
}

module.exports = { ...models, sequelize, Sequelize, initDB }
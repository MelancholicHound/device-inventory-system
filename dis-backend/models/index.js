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
        BrandAIO, BrandLaptop, BrandPrinter, BrandRouter, BrandScanner, BrandTablet, BrandUPS,
        CapacityGPU, CapacityRAM, CapacityStorage,
        PartGPU, PartRAM, PartStorage, PartProcessor, PartMotherboard, PartChipset,
        StorageType, UPS, SoftwareProductivity, SoftwareOS, SoftwareSecurity, Peripheral, Connection,
        ProcessorAIO, AIO, RAMAIO, StorageAIO, ConnectionsAIO, PeripheralsAIO,
        ProcessorComputer, MotherboardComputer, Computer, RAMComputer, StorageComputer, ConnectionsComputer, PeripheralsComputer,
        ProcessorLaptop, Laptop, RAMLaptop, StorageLaptop, ConnectionsLaptop, PeripheralsLaptop,
        Printer, PrinterType, Scanner, ScannerType, Router, NetworkSpeed, AntennaCount,
        ChipsetTablet, Tablet, PeripheralsTablet, ConnectionsTablet
    } = models;

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        await sequelize.sync();
        console.log('Tables synced.');
 
        CapacityRAM.hasMany(PartRAM, { foreignKey: 'ram_id' });
        PartRAM.belongsTo(CapacityRAM, { foreignKey: 'ram_id' });

        CapacityGPU.hasMany(PartGPU, { foreignKey: 'gpu_id' });
        PartGPU.belongsTo(CapacityGPU, { foreignKey: 'gpu_id' });
        
        CapacityStorage.hasMany(PartStorage, { foreignKey: 'storage_id' });
        StorageType.hasMany(PartStorage, { foreignKey: 'type_id' });
        PartStorage.belongsTo(StorageType, { foreignKey: 'type_id' });
        PartStorage.belongsTo(CapacityStorage, { foreignKey: 'storage_id' });

        BrandProcessor.hasMany(BrandSeriesProcessor, { foreignKey: 'brand_id' });
        BrandSeriesProcessor.belongsTo(BrandProcessor, { foreignKey: 'brand_id' });

        BrandSeriesProcessor.hasMany(PartProcessor, { foreignKey: 'series_id' });
        PartProcessor.belongsTo(BrandSeriesProcessor, { foreignKey: 'series_id' });

        BrandMotherboard.hasMany(PartMotherboard, { foreignKey: 'brand_id' });
        PartMotherboard.belongsTo(BrandMotherboard, { foreignKey: 'brand_id' });

        BrandChipset.hasMany(PartChipset, { foreignKey: 'brand_id' });
        PartChipset.belongsTo(BrandChipset, { foreignKey: 'brand_id' });

        Batch.belongsTo(PurchaseRequestDTO, { foreignKey: 'prDTO_id' });
        PurchaseRequestDTO.hasMany(Batch, { foreignKey: 'prDTO_id' });

        Batch.belongsTo(Supplier, { foreignKey: 'supplier_id' });
        Supplier.hasMany(Batch, { foreignKey: 'supplier_id' });

        Batch.belongsTo(User, { foreignKey: 'created_by',  });
        User.hasMany(Batch, { foreignKey: 'created_by' });

        Section.belongsTo(Division, { foreignKey: 'div_id' });
        Division.hasMany(Section, { foreignKey: 'div_id' });

        //AIO Associations
        AIO.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(AIO, { foreignKey: 'batch_id' });

        AIO.belongsTo(Section, { foreignKey: 'section_id' });
        Section.hasMany(AIO, { foreignKey: 'section_id' });

        AIO.belongsTo(BrandAIO, { foreignKey: 'brand_id' });
        BrandAIO.hasMany(AIO, { foreignKey: 'brand_id' });

        AIO.belongsTo(UPS, { foreignKey: 'ups_id' });
        UPS.hasOne(AIO, { foreignKey: 'ups_id' });

        AIO.belongsTo(PartGPU, { foreignKey: 'gpu_id' });
        PartGPU.hasOne(AIO, { foreignKey: 'gpu_id' });

        AIO.belongsTo(SoftwareOS, { foreignKey: 'os_id' });
        AIO.belongsTo(SoftwareProductivity, { foreignKey: 'prod_id' });
        AIO.belongsTo(SoftwareSecurity, { foreignKey: 'security_id' });

        SoftwareOS.hasMany(AIO, { foreignKey: 'os_id' });
        SoftwareProductivity.hasMany(AIO, { foreignKey: 'prod_id' });
        SoftwareSecurity.hasMany(AIO, { foreignKey: 'security_id' });

        AIO.hasOne(ProcessorAIO, { foreignKey: 'aio_id' });
        ProcessorAIO.belongsTo(AIO, { foreignKey: 'aio_id' });
        
        ProcessorAIO.belongsTo(PartProcessor, { foreignKey: 'cpu_id' });
        PartProcessor.hasOne(ProcessorAIO, { foreignKey: 'cpu_id' });

        AIO.hasMany(RAMAIO, { foreignKey: 'aio_id' });
        RAMAIO.belongsTo(AIO, { foreignKey: 'aio_id' });

        RAMAIO.belongsTo(PartRAM, { foreignKey: 'ram_id' });
        PartRAM.hasMany(RAMAIO, { foreignKey: 'ram_id' });

        AIO.hasMany(StorageAIO, { foreignKey: 'aio_id' });
        StorageAIO.belongsTo(AIO, { foreignKey: 'aio_id' });

        StorageAIO.belongsTo(PartStorage, { foreignKey: 'storage_id' });
        PartStorage.hasMany(StorageAIO, { foreignKey: 'storage_id' });

        AIO.hasMany(ConnectionsAIO, { foreignKey: 'aio_id' });
        ConnectionsAIO.belongsTo(AIO, { foreignKey: 'aio_id' });

        ConnectionsAIO.belongsTo(Connection, { foreignKey: 'connection_id' });
        Connection.hasMany(ConnectionsAIO, { foreignKey: 'connection_id' });

        AIO.hasMany(PeripheralsAIO, { foreignKey: 'aio_id' });
        PeripheralsAIO.belongsTo(AIO, { foreignKey: 'aio_id' });

        PeripheralsAIO.belongsTo(Peripheral, { foreignKey: 'peripheral_id' });
        Peripheral.hasMany(PeripheralsAIO, { foreignKey: 'peripheral_id' });

        //Computer Associations
        Computer.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(Computer, { foreignKey: 'batch_id' });

        Computer.belongsTo(Section, { foreignKey: 'section_id' });
        Section.hasMany(Computer, { foreignKey: 'section_id' });

        Computer.belongsTo(UPS, { foreignKey: 'ups_id' });
        UPS.hasOne(Computer, { foreignKey: 'ups_id' });

        Computer.belongsTo(PartGPU, { foreignKey: 'gpu_id' });
        PartGPU.hasOne(Computer, { foreignKey: 'gpu_id' });

        Computer.belongsTo(SoftwareOS, { foreignKey: 'os_id' });
        Computer.belongsTo(SoftwareProductivity, { foreignKey: 'prod_id' });
        Computer.belongsTo(SoftwareSecurity, { foreignKey: 'security_id' });

        SoftwareOS.hasMany(Computer, { foreignKey: 'os_id' });
        SoftwareProductivity.hasMany(Computer, { foreignKey: 'prod_id' });
        SoftwareSecurity.hasMany(Computer, { foreignKey: 'security_id' });

        Computer.hasOne(ProcessorComputer, { foreignKey: 'computer_id' });
        ProcessorComputer.belongsTo(Computer, { foreignKey: 'computer_id' });

        ProcessorComputer.belongsTo(PartProcessor, { foreignKey: 'cpu_id' });
        PartProcessor.hasMany(ProcessorComputer, { foreignKey: 'cpu_id' });

        Computer.hasOne(MotherboardComputer, { foreignKey: 'computer_id' });
        MotherboardComputer.belongsTo(Computer, { foreignKey: 'computer_id' });

        MotherboardComputer.belongsTo(PartMotherboard, { foreignKey: 'mobo_id' });
        PartMotherboard.hasOne(MotherboardComputer, { foreignKey: 'mobo_id' })

        Computer.hasMany(RAMComputer, { foreignKey: 'computer_id' });
        RAMComputer.belongsTo(Computer, { foreignKey: 'computer_id' });

        RAMComputer.belongsTo(PartRAM, { foreignKey: 'ram_id' });
        PartRAM.hasMany(RAMComputer, { foreignKey: 'ram_id' });

        Computer.hasMany(StorageComputer, { foreignKey: 'computer_id' });
        StorageComputer.belongsTo(Computer, { foreignKey: 'computer_id' });

        StorageComputer.belongsTo(PartStorage, { foreignKey: 'storage_id' });
        PartStorage.hasMany(StorageComputer, { foreignKey: 'storage_id' });

        Computer.hasMany(ConnectionsComputer, { foreignKey: 'computer_id' });
        ConnectionsComputer.belongsTo(Computer, { foreignKey: 'computer_id' });

        ConnectionsComputer.belongsTo(Connection, { foreignKey: 'connection_id' });
        Connection.hasMany(ConnectionsComputer, { foreignKey: 'connection_id' });

        Computer.hasMany(PeripheralsComputer, { foreignKey: 'computer_id' });
        PeripheralsComputer.belongsTo(Computer, { foreignKey: 'computer_id' });

        PeripheralsComputer.belongsTo(Peripheral, { foreignKey: 'peripheral_id' });
        Peripheral.hasMany(PeripheralsComputer, { foreignKey: 'peripheral_id' });

        //Laptop Associations
        Laptop.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(Laptop, { foreignKey: 'batch_id' });

        Laptop.belongsTo(Section, { foreignKey: 'section_id' });
        Section.hasMany(Laptop, { foreignKey: 'section_id' });

        Laptop.belongsTo(BrandLaptop, { foreignKey: 'brand_id' });
        BrandLaptop.hasMany(Laptop, { foreignKey: 'brand_id' });

        Laptop.belongsTo(UPS, { foreignKey: 'ups_id' });
        UPS.hasOne(Laptop, { foreignKey: 'ups_id' });

        Laptop.belongsTo(PartGPU, { foreignKey: 'gpu_id' });
        PartGPU.hasOne(Laptop, { foreignKey: 'gpu_id' });
        
        Laptop.belongsTo(SoftwareOS, { foreignKey: 'os_id' });
        Laptop.belongsTo(SoftwareProductivity, { foreignKey: 'prod_id' });
        Laptop.belongsTo(SoftwareSecurity, { foreignKey: 'security_id' });

        SoftwareOS.hasMany(Laptop, { foreignKey: 'os_id' });
        SoftwareProductivity.hasMany(Laptop, { foreignKey: 'prod_id' });
        SoftwareSecurity.hasMany(Laptop, { foreignKey: 'security_id' });

        Laptop.hasOne(ProcessorLaptop, { foreignKey: 'laptop_id' });
        ProcessorLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id' });
        
        ProcessorLaptop.belongsTo(PartProcessor, { foreignKey: 'cpu_id' });
        PartProcessor.hasOne(ProcessorLaptop, { foreignKey: 'cpu_id' });

        Laptop.hasMany(RAMLaptop, { foreignKey: 'laptop_id' });
        RAMLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id' });

        RAMLaptop.belongsTo(PartRAM, { foreignKey: 'ram_id' });
        PartRAM.hasMany(RAMLaptop, { foreignKey: 'ram_id' });

        Laptop.hasMany(StorageLaptop, { foreignKey: 'laptop_id' });
        StorageLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id' });

        StorageLaptop.belongsTo(PartStorage, { foreignKey: 'storage_id' });
        PartStorage.hasMany(StorageLaptop, { foreignKey: 'storage_id' });

        Laptop.hasMany(ConnectionsLaptop, { foreignKey: 'laptop_id' });
        ConnectionsLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id' });

        ConnectionsLaptop.belongsTo(Connection, { foreignKey: 'connection_id' });
        Connection.hasMany(ConnectionsLaptop, { foreignKey: 'connection_id' });

        Laptop.hasMany(PeripheralsLaptop, { foreignKey: 'laptop_id' });
        PeripheralsLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id' });

        PeripheralsLaptop.belongsTo(Peripheral, { foreignKey: 'peripheral_id' });
        Peripheral.hasMany(PeripheralsLaptop, { foreignKey: 'peripheral_id' });

        //Printer Associations
        Printer.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(Printer, { foreignKey: 'batch_id' });

        Printer.belongsTo(Section, { foreignKey: 'section_id' });
        Section.hasMany(Printer, { foreignKey: 'section_id' });

        Printer.belongsTo(BrandPrinter, { foreignKey: 'brand_id' });
        BrandPrinter.hasMany(Printer, { foreignKey: 'brand_id' });

        Printer.belongsTo(PrinterType, { foreignKey: 'type_id' });
        PrinterType.hasMany(Printer, { foreignKey: 'type_id' });

        //Router Associations
        Router.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(Router, { foreignKey: 'batch_id' });

        Router.belongsTo(Section, { foreignKey: 'section_id' });
        Section.hasMany(Router, { foreignKey: 'section_id' });

        Router.belongsTo(BrandRouter, { foreignKey: 'brand_id' });
        BrandRouter.hasMany(Router, { foreignKey: 'brand_id' });

        Router.belongsTo(NetworkSpeed, { foreignKey: 'network_speed_id' });
        NetworkSpeed.hasMany(Router, { foreignKey: 'network_speed_id' });

        Router.belongsTo(AntennaCount, { foreignKey: 'antenna_id' });
        AntennaCount.hasMany(Router, { foreignKey: 'antenna_id' });

        //Scanner Association
        Scanner.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(Scanner, { foreignKey: 'batch_id' });

        Scanner.belongsTo(Section, { foreignKey: 'section_id' });
        Section.hasMany(Scanner, { foreignKey: 'section_id' });

        Scanner.belongsTo(BrandScanner, { foreignKey: 'brand_id' });
        BrandScanner.hasMany(Scanner, { foreignKey: 'brand_id' });
        
        Scanner.belongsTo(ScannerType, { foreignKey: 'type_id' });
        ScannerType.hasMany(Scanner, { foreignKey: 'type_id' });

        //Tablet Association
        Tablet.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(Tablet, { foreignKey: 'batch_id' });

        Tablet.belongsTo(Section, { foreignKey: 'section_id' });
        Section.hasMany(Tablet, { foreignKey: 'section_id' });

        Tablet.belongsTo(BrandTablet, { foreignKey: 'brand_id' });
        BrandTablet.hasMany(Tablet, { foreignKey: 'brand_id' });

        BrandChipset.hasMany(PartChipset, { foreignKey: 'brand_id' });
        PartChipset.belongsTo(BrandChipset, { foreignKey: 'brand_id' });

        Tablet.hasOne(ChipsetTablet, { foreignKey: 'tablet_id' });
        ChipsetTablet.belongsTo(Tablet, { foreignKey: 'tablet_id' });

        ChipsetTablet.belongsTo(PartChipset, { foreignKey: 'cpu_id' });
        PartChipset.hasMany(ChipsetTablet, { foreignKey: 'cpu_id' });

        Tablet.hasMany(ConnectionsTablet, { foreignKey: 'tablet_id' });
        ConnectionsTablet.belongsTo(Tablet, { foreignKey: 'tablet_id' });

        ConnectionsTablet.belongsTo(Connection, { foreignKey: 'connection_id' });
        Connection.hasMany(ConnectionsTablet, { foreignKey: 'connection_id' });

        Tablet.hasMany(PeripheralsTablet, { foreignKey: 'tablet_id' });
        PeripheralsTablet.belongsTo(Tablet, { foreignKey: 'tablet_id' });

        PeripheralsTablet.belongsTo(Peripheral, { foreignKey: 'peripheral_id' });
        Peripheral.hasMany(PeripheralsTablet, { foreignKey: 'peripheral_id' });

        //UPS Associations
        UPS.belongsTo(Batch, { foreignKey: 'batch_id' });
        Batch.hasMany(UPS, { foreignKey: 'batch_id' });

        UPS.belongsTo(Section, { focus: 'section_id' });
        Section.hasMany(UPS, { foreignKey: 'section' });

        UPS.belongsTo(BrandUPS, { foreignKey: 'brand_id' });
        BrandUPS.hasMany(UPS, { foreignKey: 'brand_id' });

        console.log('Tables associated.');

        await seederPath(models);
        console.log('Values inserted.');
    } catch (error) {
        console.error('Unable to connect to the database: ', error);
    }
}

module.exports = { ...models, sequelize, Sequelize, initDB }
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
 
        CapacityRAM.hasMany(PartRAM, { foreignKey: 'capacity_id', as: 'ram_module' });
        PartRAM.belongsTo(CapacityRAM, { foreignKey: 'capacity_id', as: 'capacity' });

        CapacityGPU.hasMany(PartGPU, { foreignKey: 'capacity_id', as: 'gpu_module' });
        PartGPU.belongsTo(CapacityGPU, { foreignKey: 'capacity_id', as: 'capacity' });
        
        CapacityStorage.hasMany(PartStorage, { foreignKey: 'capacity_id', as: 'storage_dto' });
        PartStorage.belongsTo(CapacityStorage, { foreignKey: 'capacity_id', as: 'capacity' });

        StorageType.hasMany(PartStorage, { foreignKey: 'type_id', as: 'storage_dto' });
        PartStorage.belongsTo(StorageType, { foreignKey: 'type_id', as: 'type' });

        BrandProcessor.hasMany(BrandSeriesProcessor, { foreignKey: 'brand_id', as: 'series_list' });
        BrandSeriesProcessor.belongsTo(BrandProcessor, { foreignKey: 'brand_id', as: 'brand' });

        BrandSeriesProcessor.hasMany(PartProcessor, { foreignKey: 'series_id', as: 'processors' });
        PartProcessor.belongsTo(BrandSeriesProcessor, { foreignKey: 'series_id', as: 'series' });

        BrandMotherboard.hasMany(PartMotherboard, { foreignKey: 'brand_id', as: 'motherboards' });
        PartMotherboard.belongsTo(BrandMotherboard, { foreignKey: 'brand_id', as: 'brand' });

        BrandChipset.hasMany(PartChipset, { foreignKey: 'brand_id', as: 'chipsets' });
        PartChipset.belongsTo(BrandChipset, { foreignKey: 'brand_id', as: 'brand' });

        Batch.belongsTo(PurchaseRequestDTO, { foreignKey: 'prDTO_id', as: 'purchaseRequestDTO' });
        PurchaseRequestDTO.hasMany(Batch, { foreignKey: 'prDTO_id', as: 'batches' });

        Batch.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
        Supplier.hasMany(Batch, { foreignKey: 'supplier_id', as: 'batches' });

        Batch.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
        User.hasMany(Batch, { foreignKey: 'created_by', as: 'batches_created' });

        Section.belongsTo(Division, { foreignKey: 'div_id', as: 'division' });
        Division.hasMany(Section, { foreignKey: 'div_id', as: 'sections' });

        //AIO Associations
        AIO.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        Batch.hasMany(AIO, { foreignKey: 'batch_id', as: 'aio_devices' });

        AIO.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        Section.hasMany(AIO, { foreignKey: 'section_id', as: 'aio_devices' });

        AIO.belongsTo(BrandAIO, { foreignKey: 'brand_id', as: 'brand' });
        BrandAIO.hasMany(AIO, { foreignKey: 'brand_id', as: 'aio_devices' });

        AIO.belongsTo(UPS, { foreignKey: 'ups_id', as: 'ups' });
        UPS.hasOne(AIO, { foreignKey: 'ups_id', as: 'aio_device' });

        AIO.belongsTo(PartGPU, { foreignKey: 'gpu_id', as: 'gpu' });
        PartGPU.hasOne(AIO, { foreignKey: 'gpu_id', as: 'aio_device' });

        AIO.belongsTo(SoftwareOS, { foreignKey: 'os_id', as: 'os' });
        AIO.belongsTo(SoftwareProductivity, { foreignKey: 'prod_id', as: 'productivity' });
        AIO.belongsTo(SoftwareSecurity, { foreignKey: 'security_id', as: 'security' });

        AIO.hasOne(ProcessorAIO, { foreignKey: 'aio_id', as: 'processor' });
        ProcessorAIO.belongsTo(AIO, { foreignKey: 'aio_id', as: 'aio' });
        ProcessorAIO.belongsTo(PartProcessor, { foreignKey: 'cpu_id', as: 'cpu' });
        PartProcessor.hasOne(ProcessorAIO, { foreignKey: 'cpu_id', as: 'used_in_AIO' });

        AIO.hasMany(RAMAIO, { foreignKey: 'aio_id', as: 'ram_modules' });
        RAMAIO.belongsTo(AIO, { foreignKey: 'aio_id', as: 'aio' });
        RAMAIO.belongsTo(PartRAM, { foreignKey: 'ram_id', as: 'ram' });
        PartRAM.hasMany(RAMAIO, { foreignKey: 'ram_id', as: 'used_in_AIO' });

        AIO.hasMany(StorageAIO, { foreignKey: 'aio_id', as: 'storage_dto' });
        StorageAIO.belongsTo(AIO, { foreignKey: 'aio_id', as: 'aio' });
        StorageAIO.belongsTo(PartStorage, { foreignKey: 'storage_id', as: 'storage' });
        PartStorage.hasMany(StorageAIO, { foreignKey: 'storage_id', as: 'used_in_AIO' });

        AIO.hasMany(ConnectionsAIO, { foreignKey: 'aio_id', as: 'connections' });
        ConnectionsAIO.belongsTo(AIO, { foreignKey: 'aio_id', as: 'aio' });
        ConnectionsAIO.belongsTo(Connection, { foreignKey: 'connection_id', as: 'connection' });
        Connection.hasMany(ConnectionsAIO, { foreignKey: 'connection_id', as: 'aio_connections' });

        AIO.hasMany(PeripheralsAIO, { foreignKey: 'aio_id', as: 'peripherals' });
        PeripheralsAIO.belongsTo(AIO, { foreignKey: 'aio_id', as: 'aio' });
        PeripheralsAIO.belongsTo(Peripheral, { foreignKey: 'peripheral_id', as: 'peripheral' });
        Peripheral.hasMany(PeripheralsAIO, { foreignKey: 'peripheral_id', as: 'aio_peripherals' });

        //Computer Associations
        Computer.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        Computer.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        Computer.belongsTo(UPS, { foreignKey: 'ups_id', as: 'ups' });
        Computer.belongsTo(PartGPU, { foreignKey: 'gpu_id', as: 'gpu' });
        Computer.belongsTo(SoftwareOS, { foreignKey: 'os_id', as: 'os' });
        Computer.belongsTo(SoftwareProductivity, { foreignKey: 'prod_id', as: 'productivity' });
        Computer.belongsTo(SoftwareSecurity, { foreignKey: 'security_id', as: 'security' });

        Computer.hasOne(ProcessorComputer, { foreignKey: 'computer_id', as: 'processor' });
        ProcessorComputer.belongsTo(Computer, { foreignKey: 'computer_id', as: 'computer' });
        ProcessorComputer.belongsTo(PartProcessor, { foreignKey: 'cpu_id', as: 'cpu' });
        PartProcessor.hasMany(ProcessorComputer, { foreignKey: 'cpu_id', as: 'used_in_computers' });

        Computer.hasOne(MotherboardComputer, { foreignKey: 'computer_id', as: 'motherboard' });
        MotherboardComputer.belongsTo(Computer, { foreignKey: 'computer_id', as: 'computer' });
        MotherboardComputer.belongsTo(PartMotherboard, { foreignKey: 'mobo_id', as: 'mobo' });
        PartMotherboard.hasOne(MotherboardComputer, { foreignKey: 'mobo_id', as: 'used_in_computer' });

        Computer.hasMany(RAMComputer, { foreignKey: 'computer_id', as: 'ram_modules' });
        RAMComputer.belongsTo(Computer, { foreignKey: 'computer_id', as: 'computer' });
        RAMComputer.belongsTo(PartRAM, { foreignKey: 'ram_id', as: 'ram' });
        PartRAM.hasMany(RAMComputer, { foreignKey: 'ram_id', as: 'used_in_computers' });

        Computer.hasMany(StorageComputer, { foreignKey: 'computer_id', as: 'storage_dto' });
        StorageComputer.belongsTo(Computer, { foreignKey: 'computer_id', as: 'computer' });
        StorageComputer.belongsTo(PartStorage, { foreignKey: 'storage_id', as: 'storage' });
        PartStorage.hasMany(StorageComputer, { foreignKey: 'storage_id', as: 'used_in_computers' });

        Computer.hasMany(ConnectionsComputer, { foreignKey: 'computer_id', as: 'connections' });
        ConnectionsComputer.belongsTo(Computer, { foreignKey: 'computer_id', as: 'computer' });
        ConnectionsComputer.belongsTo(Connection, { foreignKey: 'connection_id', as: 'connection' });

        Computer.hasMany(PeripheralsComputer, { foreignKey: 'computer_id', as: 'peripherals' });
        PeripheralsComputer.belongsTo(Computer, { foreignKey: 'computer_id', as: 'computer' });
        PeripheralsComputer.belongsTo(Peripheral, { foreignKey: 'peripheral_id', as: 'peripheral' });

        //Laptop Associations
        Laptop.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        Laptop.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        Laptop.belongsTo(BrandLaptop, { foreignKey: 'brand_id', as: 'brand' });
        Laptop.belongsTo(UPS, { foreignKey: 'ups_id', as: 'ups' });
        Laptop.belongsTo(PartGPU, { foreignKey: 'gpu_id', as: 'gpu' });
        Laptop.belongsTo(SoftwareOS, { foreignKey: 'os_id', as: 'os' });
        Laptop.belongsTo(SoftwareProductivity, { foreignKey: 'prod_id', as: 'productivity' });
        Laptop.belongsTo(SoftwareSecurity, { foreignKey: 'security_id', as: 'security' });

        Laptop.hasOne(ProcessorLaptop, { foreignKey: 'laptop_id', as: 'processor' });
        ProcessorLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id', as: 'laptop' });
        ProcessorLaptop.belongsTo(PartProcessor, { foreignKey: 'cpu_id', as: 'cpu' });

        Laptop.hasMany(RAMLaptop, { foreignKey: 'laptop_id', as: 'ram_modules' });
        RAMLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id', as: 'laptop' });
        RAMLaptop.belongsTo(PartRAM, { foreignKey: 'ram_id', as: 'ram' });

        Laptop.hasMany(StorageLaptop, { foreignKey: 'laptop_id', as: 'storage_dto' });
        StorageLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id', as: 'laptop' });
        StorageLaptop.belongsTo(PartStorage, { foreignKey: 'storage_id', as: 'storage' });

        Laptop.hasMany(ConnectionsLaptop, { foreignKey: 'laptop_id', as: 'connections' });
        ConnectionsLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id', as: 'laptop' });
        ConnectionsLaptop.belongsTo(Connection, { foreignKey: 'connection_id', as: 'connection' });

        Laptop.hasMany(PeripheralsLaptop, { foreignKey: 'laptop_id', as: 'peripherals' });
        PeripheralsLaptop.belongsTo(Laptop, { foreignKey: 'laptop_id', as: 'laptop' });
        PeripheralsLaptop.belongsTo(Peripheral, { foreignKey: 'peripheral_id', as: 'peripheral' });

        //Printer Associations
        Printer.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        Printer.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        Printer.belongsTo(BrandPrinter, { foreignKey: 'brand_id', as: 'brand' });
        Printer.belongsTo(PrinterType, { foreignKey: 'type_id', as: 'type' });

        Batch.hasMany(Printer, { foreignKey: 'batch_id', as: 'printers' });
        Section.hasMany(Printer, { foreignKey: 'section_id', as: 'printers' });
        BrandPrinter.hasMany(Printer, { foreignKey: 'brand_id', as: 'printers' });
        PrinterType.hasMany(Printer, { foreignKey: 'type_id', as: 'printers' });

        //Router Associations
        Router.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        Router.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        Router.belongsTo(BrandRouter, { foreignKey: 'brand_id', as: 'brand' });
        Router.belongsTo(NetworkSpeed, { foreignKey: 'network_speed_id', as: 'network_speed' });
        Router.belongsTo(AntennaCount, { foreignKey: 'antenna_id', as: 'antenna' });

        Batch.hasMany(Router, { foreignKey: 'batch_id', as: 'routers' });
        Section.hasMany(Router, { foreignKey: 'section_id', as: 'routers' });
        BrandRouter.hasMany(Router, { foreignKey: 'brand_id', as: 'routers' });
        NetworkSpeed.hasMany(Router, { foreignKey: 'network_speed_id', as: 'routers' });
        AntennaCount.hasMany(Router, { foreignKey: 'antenna_id', as: 'routers' });

        //Scanner Association
        Scanner.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        Scanner.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        Scanner.belongsTo(BrandScanner, { foreignKey: 'brand_id', as: 'brand' });
        Scanner.belongsTo(ScannerType, { foreignKey: 'type_id', as: 'type' });

        Batch.hasMany(Scanner, { foreignKey: 'batch_id', as: 'scanners' });
        Section.hasMany(Scanner, { foreignKey: 'section_id', as: 'scanners' });
        BrandScanner.hasMany(Scanner, { foreignKey: 'brand_id', as: 'scanners' });
        ScannerType.hasMany(Scanner, { foreignKey: 'type_id', as: 'scanners' });

        //Tablet Association
        Tablet.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        Tablet.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        Tablet.belongsTo(BrandTablet, { foreignKey: 'brand_id', as: 'brand' });

        Tablet.hasOne(ChipsetTablet, { foreignKey: 'tablet_id', as: 'chipset' });
        ChipsetTablet.belongsTo(Tablet, { foreignKey: 'tablet_id', as: 'tablet' });
        ChipsetTablet.belongsTo(PartChipset, { foreignKey: 'cpu_id', as: 'chipset_part' });

        Tablet.hasMany(ConnectionsTablet, { foreignKey: 'tablet_id', as: 'connections' });
        ConnectionsTablet.belongsTo(Tablet, { foreignKey: 'tablet_id', as: 'tablet' });
        ConnectionsTablet.belongsTo(Connection, { foreignKey: 'connection_id', as: 'connection' });

        Tablet.hasMany(PeripheralsTablet, { foreignKey: 'tablet_id', as: 'peripherals' });
        PeripheralsTablet.belongsTo(Tablet, { foreignKey: 'tablet_id', as: 'tablet' });
        PeripheralsTablet.belongsTo(Peripheral, { foreignKey: 'peripheral_id', as: 'peripheral' });
       
        Tablet.belongsTo(CapacityRAM, { foreignKey: 'ram_capacity_id', as: 'ram' });

        Tablet.belongsTo(CapacityStorage, { foreignKey: 'storage_capacity_id', as: 'storage' });

        //UPS Associations
        UPS.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
        UPS.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
        UPS.belongsTo(BrandUPS, { foreignKey: 'brand_id', as: 'brand' });

        Batch.hasMany(UPS, { foreignKey: 'batch_id', as: 'ups_devices' });
        Section.hasMany(UPS, { foreignKey: 'section_id', as: 'ups_devices' });
        BrandUPS.hasMany(UPS, { foreignKey: 'brand_id', as: 'ups_devices' });

        console.log('Tables associated.');

        await seederPath(models);
        console.log('Values inserted.');
    } catch (error) {
        console.error('Unable to connect to the database: ', error);
    }
}

module.exports = { ...models, sequelize, Sequelize, initDB }
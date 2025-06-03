const { createErrors } = require('../controllers/error');

const seedIfEmpty = async(model, dataArray, keyName) => {
    if (await model.count() === 0) {
        const objects = dataArray.map(item => ({ [keyName]: item }));
        await model.bulkCreate(objects);
    }
}

module.exports = async(models) => {
    const { 
        Division, Section,
        BrandAIO, BrandLaptop, BrandPrinter, BrandRouter, BrandScanner, BrandTablet, BrandUPS,
        BrandMotherboard, BrandProcessor, BrandChipset, BrandSeriesProcessor,
        CapacityGPU, CapacityRAM, CapacityStorage,
        PrinterType, ScannerType, StorageType, NetworkSpeed, AntennaCount,
        Connection, Peripheral, SoftwareOS, SoftwareSecurity, SoftwareProductivity
    } = models;

    try {
        if (await Division.count() === 0) {
            await Division.bulkCreate([
                { name: 'ALLIED HEALTH AND PROFESSIONAL SERVICES' },
                { name: 'FINANCE' },
                { name: 'HOSPITAL OPERATIONS AND PATIENT SUPPORT SERVICE' },
                { name: 'MEDICAL' },
                { name: 'NURSING' },
                { name: 'UNDER MCC' },
                { name: 'OTHERS' }
            ]);
        }

        if (await NetworkSpeed.count() === 0) {
            await NetworkSpeed.bulkCreate([
                { speed_by_mbps: 100 },
                { speed_by_mbps: 200 },
                { speed_by_mbps: 500 }
            ]);
        }

        if (await AntennaCount.count() === 0) {
            await AntennaCount.bulkCreate([
                { antenna_count: 2 },
                { antenna_count: 4 },
                { antenna_count: 6 }
            ]);
        }

        const brandData = [
            { model: BrandAIO, data: ['Dell', 'Acer', 'AOC'], key: 'name' },
            { model: BrandLaptop, data: ['Acer', 'Lenovo', 'HP'], key: 'name' },
            { model: BrandPrinter, data: ['Epson', 'Canon', 'Brother'], key: 'name' },
            { model: BrandRouter, data: ['TP-Link', 'Asus', 'Tenda'], key: 'name' },
            { model: BrandScanner, data: ['Panasonic', 'Canon', 'Epson'], key: 'name' },
            { model: BrandTablet, data: ['Samsung', 'Apple', 'Xiaomi'], key: 'name' },
            { model: BrandUPS, data: ['Eaton', 'Toshiba', 'Emerson'], key: 'name' },
            { model: BrandProcessor, data: ['Intel', 'AMD'], key: 'name' },
            { model: BrandMotherboard, data: ['Asus', 'Gigabyte', 'MSI'], key: 'name' },
            { model: BrandChipset, data: ['Snapdragon', 'Mediatek'], key: 'name' }
        ];

        const capacityData = [
            { model: CapacityGPU, data: [2, 4, 6, 8], key: 'capacity' },
            { model: CapacityRAM, data: [2, 4, 6, 8], key: 'capacity' },
            { model: CapacityStorage, data: [128, 256, 512, 1024], key: 'capacity' }
        ];

        const typeData = [
            { model: PrinterType, data: ['Dot Matrix', 'Laser', 'Inkjet', 'CISS'], key: 'type' },
            { model: ScannerType, data: ['Flatbed', 'Sheetfed', 'Bracode', 'Duplex'], key: 'type' },
            { model: StorageType, data: ['HDD', 'SSD'], key: 'type' }
        ]

        const serviceData = [
            { model: Connection, data: [
                'Internet', 'HIS', 'MMS', 'PIS', 'MLIS', 'LIS', 'EHR', 'eRNet', 'ENGAS', 'HRIPS', 'PACS with RIS', 'Connected to Equipment'
            ], key: 'name' },
            { model: Peripheral, data: [
                'Wireless Mouse', 'Wireless Keyboard', 'Wired Mouse', 'Wired Keyboard', 'Monitor', 'E-Pen', 'Headset', 'Earphone', 'Charger', 'Webcam', 'Power Cable'
            ], key: 'name' },
            { model: SoftwareOS, data: [
                'Windows - 7', 'Windows - 10', 'Windows - 11', 'Mac - Monterey', 'Mac - Sonoma', 'Mac - Ventura', 'Linux - Ubuntu', 'Linux - Linux Mint', 'Linux - Dedian'
            ], key: 'name' },
            { model: SoftwareProductivity, data: [
                'WPS Office', 'Microsoft Office'
            ], key: 'name' },
            { model: SoftwareSecurity, data: [
                'Norton', 'Kaspersky', 'Eset', 'AVG', 'McAfee', 'Avast'
            ], key: 'name' }
        ];

        for (const { model, data, key } of brandData) {
            await seedIfEmpty(model, data, key);
        }

        for (const { model, data, key } of capacityData) {
            await seedIfEmpty(model, data, key);
        }

        for (const { model, data, key } of typeData) {
            await seedIfEmpty(model, data, key);
        }

        for (const { model, data, key } of serviceData) {
            await seedIfEmpty(model, data, key);
        }

        const allied = await Division.findOne({ where: { name: 'ALLIED HEALTH AND PROFESSIONAL SERVICES' } });
        const finance = await Division.findOne({ where: { name: 'FINANCE' } });
        const hopss = await Division.findOne({ where: { name: 'HOSPITAL OPERATIONS AND PATIENT SUPPORT SERVICE' } });
        const medical = await Division.findOne({ where: { name: 'MEDICAL' } });
        const nursing = await Division.findOne({ where: { name: 'NURSING' } });
        const underMCC = await Division.findOne({ where: { name: 'UNDER MCC' } });
        const others = await Division.findOne({ where: { name: 'OTHERS' } });
        const intel = await BrandProcessor.findOne({ where: { name: 'Intel' } });
        const amd = await BrandProcessor.findOne({ where: { name: 'AMD' } });

        if (await Section.count() === 0) {
            await Section.bulkCreate([
                { name: '2D ECHO', div_id: nursing.dataValues?.id },
                { name: 'ACCOUNTING', div_id: finance.dataValues?.id },
                { name: 'ADMITTING', div_id: allied.dataValues?.id },
                { name: 'ANATOMIC LABORATORY (HISTOPATH)', div_id: medical.dataValues?.id },
                { name: 'ANESTHESIA OFFICE', div_id: medical.dataValues?.id },
                { name: 'AUDITORIUM', div_id: hopss.dataValues?.id },
                { name: 'BAC', div_id: hopss.dataValues?.id },
                { name: 'BILLING', div_id: finance.dataValues?.id },
                { name: 'BLOODBANK', div_id: medical.dataValues?.id },
                { name: 'BREASTFEEDING ROOM', div_id: nursing.dataValues?.id },
                { name: 'BUDGET', div_id: finance.dataValues?.id },
                { name: 'CASHIER', div_id: finance.dataValues?.id },
                { name: 'CLAIMS', div_id: finance.dataValues?.id },
                { name: 'CLINICAL LABORATORY', div_id: medical.dataValues?.id },
                { name: 'CMPS', div_id: medical.dataValues?.id },
                { name: 'COA', div_id: others.dataValues?.id },
                { name: 'COOP', div_id: others.dataValues?.id },
                { name: 'CSR', div_id: nursing.dataValues?.id },
                { name: 'DENTAL', div_id: medical.dataValues?.id },
                { name: 'DIALYSIS', div_id: medical.dataValues?.id },
                { name: 'DIETARY CONFERENCE', div_id: allied.dataValues?.id },
                { name: 'DR', div_id: nursing.dataValues?.id },
                { name: 'ECG', div_id: nursing.dataValues?.id },
                { name: 'EINC', div_id: nursing.dataValues?.id },
                { name: 'ENDOSCOPY', div_id: nursing.dataValues?.id },
                { name: 'ENGINEERING', div_id: hopss.dataValues?.id },
                { name: 'ORLNHS', div_id: medical.dataValues?.id },
                { name: 'ER', div_id: medical.dataValues?.id },
                { name: 'ER-OB', div_id: medical.dataValues?.id },
                { name: 'ER-XRAY', div_id: medical.dataValues?.id },
                { name: 'FAMILY MEDICINE', div_id: medical.dataValues?.id },
                { name: 'FEMALE MEDICAL WARD', div_id: nursing.dataValues?.id },
                { name: 'FEMALE SURGICAL WARD', div_id: nursing.dataValues?.id },
                { name: 'FINANCE', div_id: finance.dataValues?.id },
                { name: 'ENGINEERING-GENERAL SERVICES', div_id: finance.dataValues?.id },
                { name: 'HEMODIALYSIS', div_id: nursing.dataValues?.id },
                { name: 'HIRMS-MAIN', div_id: allied.dataValues?.id },
                { name: 'HIRMS-ORU', div_id: allied.dataValues?.id },
                { name: 'CAO OFFICE', div_id: hopss.dataValues?.id },
                { name: 'HRMO-MAIN', div_id: hopss.dataValues?.id },
                { name: 'HRMO-EXTENSION', div_id: hopss.dataValues?.id },
                { name: 'ICU', div_id: nursing.dataValues?.id },
                { name: 'IMISS', div_id: hopss.dataValues?.id },
                { name: 'IMAGING-REGISTRATION', div_id: medical.dataValues?.id },
                { name: 'IMAGING-ER XRAY', div_id: medical.dataValues?.id },
                { name: 'IMAGING-RELEASING', div_id: medical.dataValues?.id },
                { name: 'IMAGING-CITISCAN', div_id: medical.dataValues?.id },
                { name: 'IMAGING-OPD', div_id: medical.dataValues?.id },
                { name: 'IPCC', div_id: others.dataValues?.id },
                { name: 'IRB', div_id: underMCC.dataValues?.id },
                { name: 'PACD', div_id: underMCC.dataValues?.id },
                { name: 'LEGAL', div_id: underMCC.dataValues?.id },
                { name: 'MEDICAL WARD', div_id: nursing.dataValues?.id },
                { name: 'SURGICAL WARD', div_id: nursing.dataValues?.id },
                { name: 'MATERIALS MANAGEMENT SECTION', div_id: hopss.dataValues?.id },
                { name: 'MCC OFFICE', div_id: underMCC.dataValues?.id },
                { name: 'MEDICAL SOCIAL SERVICE-MAIN', div_id: allied.dataValues?.id },
                { name: 'MEDICAL SOCIAL SERVICE-ER GF', div_id: allied.dataValues?.id },
                { name: 'MEDICAL SOCIAL SERVICE-3RD FL 6STOREY', div_id: allied.dataValues?.id },
                { name: 'MEDICINE', div_id: medical.dataValues?.id },
                { name: 'NICU', div_id: nursing.dataValues?.id },
                { name: 'NURSING OFFICE', div_id: nursing.dataValues?.id },
                { name: 'NURSING TRAINING', div_id: nursing.dataValues?.id },
                { name: 'NUTRITION AND DIETETICS', div_id: allied.dataValues?.id },
                { name: 'OB OFFICE', div_id: medical.dataValues?.id },
                { name: 'OB WARD', div_id: nursing.dataValues?.id },
                { name: 'ONCOLOGY', div_id: nursing.dataValues?.id },
                { name: 'OPD CASHIER', div_id: finance.dataValues?.id },
                { name: 'OPD-DENTAL', div_id: medical.dataValues?.id },
                { name: 'OPD-FAMILY PLANNING', div_id: medical.dataValues?.id },
                { name: 'OPD-LAB', div_id: medical.dataValues?.id },
                { name: 'OPD-MEDICINE', div_id: medical.dataValues?.id },
                { name: 'OPD-OB', div_id: medical.dataValues?.id },
                { name: 'OPD-PEDIA', div_id: medical.dataValues?.id },
                { name: 'PHARMACY-MAIN', div_id: allied.dataValues?.id },
                { name: 'PHARMACY-ER', div_id: allied.dataValues?.id },
                { name: 'OPD-SURGERY', div_id: medical.dataValues?.id },
                { name: 'OPERATING ROOM', div_id: medical.dataValues?.id },
                { name: 'OPTHA OFFICE', div_id: medical.dataValues?.id },
                { name: 'OR COMPLEX', div_id: medical.dataValues?.id },
                { name: 'ORTHO OFFICE', div_id: medical.dataValues?.id },
                { name: 'OSM', div_id: medical.dataValues?.id },
                { name: 'PACU', div_id: nursing.dataValues?.id },
                { name: 'PEDIA OFFICE', div_id: medical.dataValues?.id },
                { name: 'PEDIA QUARTERS', div_id: medical.dataValues?.id },
                { name: 'PEDIA WARD', div_id: nursing.dataValues?.id },
                { name: 'EMPLOYEES WARD', div_id: nursing.dataValues?.id },
                { name: 'PHILHEALTH-EXPRESS', div_id: finance.dataValues?.id },
                { name: 'POC-NBB', div_id: finance.dataValues?.id },
                { name: 'PROCUREMENT', div_id: hopss.dataValues?.id },
                { name: 'PHU', div_id: underMCC.dataValues?.id },
                { name: 'QMU', div_id: underMCC.dataValues?.id },
                { name: 'REHAB', div_id: medical.dataValues?.id },
                { name: 'RDU', div_id: underMCC.dataValues?.id },
                { name: 'SANCTUARIO DE PAULINO', div_id: medical.dataValues?.id },
                { name: 'SICU', div_id: nursing.dataValues?.id },
                { name: 'OPD HEAD OFFICE', div_id: nursing.dataValues?.id },
                { name: 'SURGERY', div_id: medical.dataValues?.id },
                { name: 'TB-DOTS', div_id: others.dataValues?.id },
                { name: 'TELEHEALTH', div_id: medical.dataValues?.id },
                { name: 'MULTISPECIALTY CENTER', div_id: medical.dataValues?.id } 
            ]);
        }

        if (await BrandSeriesProcessor.count() === 0) {
            await BrandSeriesProcessor.bulkCreate([
                { name: 'Core', brand_id: intel.dataValues?.id },
                { name: 'Pentium', brand_id: intel.dataValues?.id },
                { name: 'Ryzen', brand_id: amd.dataValues?.id },
                { name: 'Athlon', brand_id: amd.dataValues?.id }
            ]);
        }

    } catch (error) {
        console.error('Error in inserting values: ', error);
    }
}


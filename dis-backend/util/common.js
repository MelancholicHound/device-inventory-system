const { CapacityGPU, CapacityRAM, CapacityStorage } = require('../models/index');
const { BrandSeriesProcessor, BrandMotherboard, BrandProcessor, BrandChipset } = require('../models/index');
const { Division, Section } = require('../models/index');
const { StorageType } = require('../models/index');

async function generateRAMReport(action, oldData = {}, newData = {}) {
    const oldRAM = await CapacityRAM.findByPk(oldData.capacity_id);
    const newRAM = await CapacityRAM.findByPk(newData.capacity_id);

    if (action === 'UPDATE') {
        return `Updated from ${oldRAM.capacity} GB to ${newRAM.capacity} GB.`;
    }

    if (action === 'CONDEMN') {

    }

    if (action === 'REPLACE') {

    }

    return '';
}

async function generateGPUReport(action, oldData = {}, newData = {}) {
    const oldGPU = await CapacityGPU.findByPk(oldData.capacity_id);
    const newGPU = await CapacityGPU.findByPk(newData.capacity_id);

    if (action === 'UPDATE') {
        return `Updated from ${oldGPU.capacity} GB to ${newGPU.capacity} GB.`;
    }

    if (action === 'CONDEMN') {

    }

    if (action === 'REPLACE') {

    }

    return '';
}

async function generateStorageReport(action, oldData = {}, newData = {}) {
    const oldStorageCap = await CapacityStorage.findByPk(oldData.capacity_id);
    const newStorageCap = await CapacityStorage.findByPk(newData.capacity_id);

    const oldStorageType = await StorageType.findByPk(oldData.type_id);
    const newStorageType = await StorageType.findByPk(newData.type_id);

    if (action === 'UPDATE') {
        return `Update from ${oldStorageCap.capacity} GB ${oldStorageType.type} to ${newStorageCap.capacity} GB ${newStorageType.type}.`;
    }

    if (action === 'CONDEMN') {

    }

    if (action === 'REPLACE') {

    }

    return '';
}

async function generateMotherboardReport(action, oldData = {}, newData = {}) {
    const oldMotherboard = await BrandMotherboard.findByPk(oldData.brand_id);
    const newMotherboard = await BrandMotherboard.findByPk(newData.brand_id);

    if (action === 'UPDATE') {
        return `Update from ${oldMotherboard.name} ${oldData.model} to ${newMotherboard.name} ${newData.model}.`;
    }

    if (action === 'CONDEMN') {

    }

    if (action === 'REPLACE') {

    }

    return '';
}

async function generateProcessorReport(action, oldData = {}, newData = {}) {
    const oldProcessor = await BrandSeriesProcessor.findByPk(oldData.series_id, {
        attributes: ['name'],
        include: [
            {
                model: BrandProcessor,
                attributes: ['name']
            }
        ]
    });
    
    const newProcessor = await BrandSeriesProcessor.findByPk(newData.series_id, {
        attributes: ['name'],
        include: [
            {
                model: BrandProcessor,
                attributes: ['name']
            }
        ]
    });

    const oldProcessorBrandName = oldProcessor.BrandProcessor.name;
    const oldProcessorSeriesName = oldProcessor.name;

    const newProcessorBrandName = newProcessor.BrandProcessor.name;
    const newProcessorSeriesName = newProcessor.name;

    if (action === 'UPDATE') {
        return `Updated from ${oldProcessorBrandName} ${oldProcessorSeriesName} ${oldData.model} to ${newProcessorBrandName} ${newProcessorSeriesName} ${newData.model}.`;
    }

    if (action === 'CONDEMN') {

    }

    if (action === 'REPLACE') {

    }

    return '';
}

async function generateChipsetReport(action, oldData = {}, newData = {}) {
    const oldChipset = await BrandChipset.findByPk(oldData.brand_id);
    const newChipset = await BrandChipset.findByPk(newData.brand_id);

    if (action === 'UPDATE') {
        return `Updated from ${oldChipset.name} ${oldData.model} to ${newChipset.name} ${newData.model}.`;
    }

    if (action === 'CONDEMN') {

    }

    if (action === 'REPLACE') {

    }

    return '';
}

async function generateSectionReport(oldId, newId) {
   const oldSectionWithDivision = await Section.findByPk(oldId, {
        attributes: ['name'],
        include: {
            model: Division,
            attributes: ['name']
        }
    });

    const newSectionWithDivision = await Section.findByPk(newId, {
        attributes: ['name'],
        include: {
            model: Division,
            attributes: ['name']
        }
    });

    const oldDivName = oldSectionWithDivision.tbl_loc_division.name;
    const oldSecName = oldSectionWithDivision.name;

    const newDivName = newSectionWithDivision.tbl_loc_division.name;
    const newSecName = newSectionWithDivision.name;

    return `Change location from ${oldDivName} division (${oldSecName}) to ${newDivName} division (${newSecName}) `;
}

module.exports = {
    generateChipsetReport,
    generateGPUReport,
    generateMotherboardReport,
    generateProcessorReport,
    generateRAMReport,
    generateStorageReport,
    generateSectionReport
};
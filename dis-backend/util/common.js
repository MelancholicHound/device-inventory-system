const { CapacityGPU, CapacityRAM, CapacityStorage } = require('../models/index');
const { BrandSeriesProcessor, BrandMotherboard, BrandProcessor, BrandChipset } = require('../models/index');

async function generateRAMReport(action, oldData = {}, newData = {}) {
    const oldRAM = await CapacityRAM.findByPk(oldData.ram_id);
    const newRAM = await CapacityRAM.findByPk(newData.ram_id);

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
    const oldGPU = await CapacityGPU.findByPk(oldData.gpu_id);
    const newGPU = await CapacityGPU.findByPk(newData.gpu_id);

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
    const oldStorage = await CapacityStorage.findByPk(oldData.storage_id);
    const newStorage = await CapacityStorage.findByPk(newData.storage_id);

    if (action === 'UPDATE') {
        return `Update from ${oldStorage.capacity} GB ${oldData.model} to ${newStorage.capacity} GB ${newData.model}.`;
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

module.exports = {
    generateChipsetReport,
    generateGPUReport,
    generateMotherboardReport,
    generateProcessorReport,
    generateRAMReport,
    generateStorageReport
};
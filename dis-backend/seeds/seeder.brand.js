module.exports = async({ BrandAIO, BrandLaptop, BrandPrinter, BrandRouter, BrandScanner, BrandTablet, BrandUPS }) => {
    const countAIO = await BrandAIO.count();
    const countLaptop = await BrandLaptop.count();
    const countPrinter = await BrandPrinter.count();
    const countRouter = await BrandRouter.count();
    const countScanner = await BrandScanner.count();
    const countTablet = await BrandTablet.count();
    const countUPS = await BrandUPS.count();

    const brandData = [
        { count: countAIO, model: BrandAIO, names: ['Dell', 'Acer', 'AOC'] },
        { count: countLaptop, model: BrandLaptop, names: ['Acer', 'Lenovo', 'HP'] },
        { count: countPrinter, model: BrandPrinter, names: ['Epson', 'Canon', 'Brother'] },
        { count: countRouter, model: BrandRouter, names: ['TP-Link', 'Asus', 'Tenda'] },
        { count: countScanner, model: BrandScanner, names: ['Panasonic', 'Canon', 'Epson'] },
        { count: countTablet, model: BrandTablet, names: ['Samsung', 'Apple', 'Xiaomi'] },
        { count: countUPS, model: BrandUPS, names: ['Eaton', 'Toshiba', 'Emerson'] }
    ];

    for (const { count, model, names } of brandData) {
        if (count === 0) {
            const brandObjects = names.map(name => ({ name }));
            await model.bulkCreate(brandObjects);
        }
    }
}
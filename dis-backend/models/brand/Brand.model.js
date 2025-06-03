module.exports = (sequelize, DataTypes) => {
    const BrandAIO = sequelize.define('tbl_brand_aio', {
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
    }, {
        tableName: 'tbl_brand_aio',
        timestamps: false
    });

    const BrandLaptop = sequelize.define('tbl_brand_laptop', {
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
    }, {
        tableName: 'tbl_brand_laptop',
        timestamps: false
    });

    const BrandTablet = sequelize.define('tbl_brand_tablet', {
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
    }, {
        tableName: 'tbl_brand_tablet',
        timestamps: false
    });

    const BrandPrinter = sequelize.define('tbl_brand_printer', {
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
    }, {
        tableName: 'tbl_brand_printer',
        timestamps: false
    });

    const BrandScanner = sequelize.define('tbl_brand_scanner', {
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
    }, {
        tableName: 'tbl_brand_scanner',
        timestamps: false
    });

    const BrandRouter = sequelize.define('tbl_brand_router', {
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
    }, {
        tableName: 'tbl_brand_router',
        timestamps: false
    });

    const BrandUPS = sequelize.define('tbl_brand_ups', {
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
    }, {
        tableName: 'tbl_brand_ups',
        timestamps: false
    });

    const BrandProcessor = sequelize.define('tbl_brand_part_processor', {
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
    }, {
        tableName: 'tbl_brand_part_processor',
        timestamps: false
    });

    const BrandMotherboard = sequelize.define('tbl_brand_part_motherboard', {
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
    }, {
        tableName: 'tbl_brand_part_motherboard',
        timestamps: false
    });

    const BrandChipset = sequelize.define('tbl_brand_part_chipset', {
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
    }, {
        tableName: 'tbl_brand_part_chipset',
        timestamps: false
    })

    return {
        BrandAIO,
        BrandLaptop,
        BrandPrinter,
        BrandRouter,
        BrandScanner,
        BrandTablet,
        BrandUPS,
        BrandMotherboard,
        BrandProcessor,
        BrandChipset
    };
}
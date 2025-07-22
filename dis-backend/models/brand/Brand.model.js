module.exports = (sequelize, DataTypes) => {
     const BrandAIO = sequelize.define('tbl_brand_device_aio', {
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
        tableName: 'tbl_brand_device_aio',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const BrandLaptop = sequelize.define('tbl_brand_device_laptop', {
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
        tableName: 'tbl_brand_device_laptop',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const BrandTablet = sequelize.define('tbl_brand_device_tablet', {
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
        tableName: 'tbl_brand_device_tablet',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const BrandPrinter = sequelize.define('tbl_brand_device_printer', {
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
        tableName: 'tbl_brand_device_printer',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const BrandScanner = sequelize.define('tbl_brand_device_scanner', {
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
        tableName: 'tbl_brand_device_scanner',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const BrandRouter = sequelize.define('tbl_brand_device_router', {
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
        tableName: 'tbl_brand_device_router',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const BrandUPS = sequelize.define('tbl_brand_device_ups', {
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
        tableName: 'tbl_brand_device_ups',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

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
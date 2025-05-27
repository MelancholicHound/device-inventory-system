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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    const BrandProcessor = sequelize.define('tbl_brand_processor', {
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
        tableName: 'tbl_brand_processor',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    const BrandMotherboard = sequelize.define('tbl_brand_motherboard', {
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
        tableName: 'tbl_brand_motherboard',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    const BrandChipset = sequelize.define('tbl_brand_chipset', {
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
        tableName: 'tbl_brand_chipset',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
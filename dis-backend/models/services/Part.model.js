module.exports = (sequelize, DataTypes) => {
    const PartRAM = sequelize.define('tbl_part_ram', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ram_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_ram',
                key: 'id'
            } 
        }
    }, {
        tableName: 'tbl_part_ram',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PartStorage = sequelize.define('tbl_part_storage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        storage_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_storage',
                key: 'id'
            }
        },
        type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_storage_type',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_part_storage',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PartGPU = sequelize.define('tbl_part_gpu', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        gpu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_gpu',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_part_gpu',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PartProcessor = sequelize.define('tbl_part_processor', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        series_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_processor_series',
                key: 'id'
            }
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'tbl_part_processor',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PartMotherboard = sequelize.define('tbl_part_motherboard', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_motherboard',
                key: 'id'
            }
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'tbl_part_motherboard',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PartChipset = sequelize.define('tbl_part_chipset', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_chipset',
                key: 'id'
            }
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'tbl_part_chipset',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return {
        PartChipset,
        PartGPU,
        PartMotherboard,
        PartProcessor,
        PartRAM,
        PartStorage
    };
}
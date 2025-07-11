module.exports = (sequelize, DataTypes) => {
    const PartRAM = sequelize.define('tbl_part_ram', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        capacity_id: {
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
        capacity_id: {
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
        capacity_id: {
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

    const AuditRAM = sequelize.define('tbl_audit_part_ram', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartRAM,
                key: 'id'
            }
        },
        old_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_ram',
                key: 'id'
            }
        },
        new_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_ram'
            }
        },
        action: {
            type: DataTypes.ENUM('UPDATE', 'CONDEMN', 'REPLACE'),
            allowNull: false
        },
        report: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        updated_at: {
            type: DataTypes.DATEONLY, 
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_part_ram',
        timestamps: false
    });

    const AuditGPU = sequelize.define('tbl_audit_part_gpu', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartGPU,
                key: 'id'
            }
        },
        old_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_gpu',
                key: 'id'
            }
        },
        new_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_gpu'
            }
        },
        action: {
            type: DataTypes.ENUM('UPDATE', 'CONDEMN', 'REPLACE'),
            allowNull: false
        },
        report: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        updated_at: {
            type: DataTypes.DATEONLY, 
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_part_gpu',
        timestamps: false
    });

    const AuditStorage = sequelize.define('tbl_audit_part_storage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartStorage,
                key: 'id'
            }
        },
        old_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_storage',
                key: 'id'
            }
        },
        old_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_storage_type',
                key: 'id'
            }
        },
        new_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_storage',
                key: 'id'
            }
        },
        new_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_storage_type',
                key: 'id'
            }
        },
        action: {
            type: DataTypes.ENUM('UPDATE', 'CONDEMN', 'REPLACE'),
            allowNull: false
        },
        report: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        updated_at: {
            type: DataTypes.DATEONLY, 
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_part_storage',
        timestamps: false
    });

    const AuditProcessor = sequelize.define('tbl_audit_part_processor', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartProcessor,
                key: 'id'
            }
        },
        old_series_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_processor_series',
                key: 'id'
            }
        },
        old_model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        new_series_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_processor_series',
                key: 'id'
            }
        },
        new_model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM('UPDATE', 'CONDEMN', 'REPLACE'),
            allowNull: false
        },
        report: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        updated_at: {
            type: DataTypes.DATEONLY, 
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_part_processor',
        timestamps: false
    });

    const AuditMotherboard = sequelize.define('tbl_audit_part_motherboard', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartMotherboard,
                key: 'id'
            }
        },
        old_brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_motherboard',
                key: 'id'
            }
        },
        old_model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        new_brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_motherboard',
                key: 'id'
            }
        },
        new_model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM('UPDATE', 'CONDEMN', 'REPLACE'),
            allowNull: false
        },
        report: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        updated_at: {
            type: DataTypes.DATEONLY, 
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_part_motherboard',
        timestamps: false
    });

    const AuditChipset = sequelize.define('tbl_audit_part_chipset', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartChipset,
                key: 'id'
            }
        },
        old_brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_chipset',
                key: 'id'
            }
        },
        old_model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        new_brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_part_chipset',
                key: 'id'
            }
        },
        new_model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM('UPDATE', 'CONDEMN', 'REPLACE'),
            allowNull: false
        },
        report: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        updated_at: {
            type: DataTypes.DATEONLY, 
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_part_chipset',
        timestamps: false
    });

    return {
        PartChipset,
        PartGPU,
        PartMotherboard,
        PartProcessor,
        PartRAM,
        PartStorage,
        AuditChipset,
        AuditGPU,
        AuditMotherboard,
        AuditProcessor,
        AuditRAM,
        AuditStorage
    };
}
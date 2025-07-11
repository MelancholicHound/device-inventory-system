module.exports = (sequelize, DataTypes) => {
    const Laptop = sequelize.define('tbl_device_laptop', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        batch_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_batch',
                key: 'id'
            }
        },
        section_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_loc_section',
                key: 'id'
            }
        },
        device_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        serial_number: {
            type: DataTypes.STRING,
            unique: true
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_brand_device_laptop',
                key: 'id'
            }
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_condemned: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        ups_id: {
            type: DataTypes.INTEGER,
            unique: true,
            references: {
                model: 'tbl_device_ups',
                key: 'id'
            }
        },
        gpu_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'tbl_part_gpu',
                key: 'id'
            }
        },
        os_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_sw_opsystem',
                key: 'id'
            }
        },
        prod_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_sw_opsystem',
                key: 'id'
            }
        },
        security_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_sw_security',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_laptop',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ProcessorLaptop = sequelize.define('tbl_device_laptop_cpu', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        cpu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_part_processor',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_laptop_cpu',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const RAMLaptop = sequelize.define('tbl_device_laptop_ram', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        ram_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_part_ram',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_laptop_ram',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const StorageLaptop = sequelize.define('tbl_device_laptop_storage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        storage_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_part_storage',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_laptop_storage',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ConnectionsLaptop = sequelize.define('tbl_device_laptop_connections', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        connection_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_connection',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_laptop_connections',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PeripheralsLaptop = sequelize.define('tbl_device_laptop_peripherals', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        peripheral_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_connection',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_laptop_peripherals',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const CondemnedLaptop = sequelize.define('tbl_condemned_laptop', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        condemned_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        condemned_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    }, {
        tableName: 'tbl_condemned_laptop',
        timestamps: false
    });

    const AuditLaptopLocation = sequelize.define('tbl_audit_location_laptop', {
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        old_section_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_loc_section',
                key: 'id'
            }
        },
        new_section_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_loc_section',
                key: 'id'
            }
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
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_location_laptop',
        timestamps: false
    });

    const AuditLaptopConnection = sequelize.define('tbl_audit_connection_laptop', {
        laptop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Laptop,
                key: 'id'
            }
        },
        connection_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM('ADD', 'REMOVE'),
            allowNull: false
        },
        changed_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        },
        changed_at: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tbl_audit_connection_laptop',
        timestamps: false
    })

    return {
        ProcessorLaptop,
        Laptop,
        RAMLaptop,
        StorageLaptop,
        ConnectionsLaptop,
        PeripheralsLaptop,
        CondemnedLaptop,
        AuditLaptopConnection,
        AuditLaptopLocation
    };
}
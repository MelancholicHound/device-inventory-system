module.exports = (sequelize, DataTypes) => {
    const ProcessorLaptop = sequelize.define('tbl_device_laptop_cpu', {
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
        tableName: 'tbl_device_laptop_cpu',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

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
            allowNull: false,
            unique: true,
            references: {
                model: 'tbl_device_ups',
                key: 'id'
            }
        },
        cpu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: ProcessorLaptop,
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

    return {
        ProcessorLaptop,
        Laptop,
        RAMLaptop,
        StorageLaptop,
        ConnectionsLaptop,
        PeripheralsLaptop
    };
}
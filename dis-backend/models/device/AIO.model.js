module.exports = (sequelize, DataTypes) => {
    const AIO = sequelize.define('tbl_device_aio', {
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
                model: 'tbl_brand_device_aio',
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
        tableName: 'tbl_device_aio',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ProcessorAIO = sequelize.define('tbl_device_aio_cpu', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        aio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AIO,
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
        tableName: 'tbl_device_aio_cpu',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const RAMAIO = sequelize.define('tbl_device_aio_ram', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        aio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AIO,
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
        tableName: 'tbl_device_aio_ram',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const StorageAIO = sequelize.define('tbl_device_aio_storage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        aio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AIO,
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
        tableName: 'tbl_device_aio_storage',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ConnectionsAIO = sequelize.define('tbl_device_aio_connections', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        aio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AIO,
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
        tableName: 'tbl_device_aio_connections',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PeripheralsAIO = sequelize.define('tbl_device_aio_peripherals', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        aio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AIO,
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
        tableName: 'tbl_device_aio_peripherals',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return {
        ProcessorAIO,
        AIO,
        RAMAIO,
        StorageAIO,
        ConnectionsAIO,
        PeripheralsAIO
    };
}
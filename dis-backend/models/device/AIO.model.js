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

    const CondemnedAIO = sequelize.define('tbl_condemned_aio', {
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
        tableName: 'tbl_condemned_aio',
        timestamps: false
    });

    const AuditAIOLocation = sequelize.define('tbl_audit_location_aio', {
        aio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AIO,
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
        tableName: 'tbl_audit_location_aio',
        timestamps: false
    });

    const AuditAIOConnection = sequelize.define('tbl_audit_connection_aio', {
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
        tableName: 'tbl_audit_connection_aio',
        timestamps: false
    });

    return {
        ProcessorAIO,
        AIO,
        RAMAIO,
        StorageAIO,
        ConnectionsAIO,
        PeripheralsAIO,
        CondemnedAIO,
        AuditAIOConnection,
        AuditAIOLocation
    };
}
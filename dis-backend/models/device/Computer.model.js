module.exports = (sequelize, DataTypes) => {
    const Computer = sequelize.define('tbl_device_computer', {
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
            references: {
                model: 'tbl_misc_sw_opsystem',
                key: 'id'
            }
        },
        security_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'tbl_misc_sw_security',
                key: 'id'
            }
        },
        accountable_user: {
            type: DataTypes.STRING
        },
        co_accountable_user: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'tbl_device_computer',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ProcessorComputer = sequelize.define('tbl_device_computer_cpu', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_device_computer_cpu',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const MotherboardComputer = sequelize.define('tbl_device_computer_motherboard', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
                key: 'id'
            }
        },
        mobo_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_part_motherboard',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_computer_motherboard',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const RAMComputer = sequelize.define('tbl_device_computer_ram', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_device_computer_ram',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const StorageComputer = sequelize.define('tbl_device_computer_storage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_device_computer_storage',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ConnectionsComputer = sequelize.define('tbl_device_computer_connections', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_device_computer_connections',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PeripheralsComputer = sequelize.define('tbl_device_computer_peripherals', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_device_computer_peripherals',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const CondemnedComputer = sequelize.define('tbl_condemned_computer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_condemned_computer',
        timestamps: false
    });

    const AuditComputerLocation = sequelize.define('tbl_audit_location_computer', {
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_audit_location_computer',
        timestamps: false
    });

    const AuditComputerConnection = sequelize.define('tbl_audit_connection_computer', {
        computer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Computer,
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
        tableName: 'tbl_audit_connection_computer',
        timestamps: false
    });

    return {
        ProcessorComputer,
        MotherboardComputer,
        Computer,
        RAMComputer,
        StorageComputer,
        ConnectionsComputer,
        PeripheralsComputer,
        CondemnedComputer, 
        AuditComputerLocation,
        AuditComputerConnection
    };
}
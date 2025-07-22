module.exports = (sequelize, DataTypes) => {
    const Tablet = sequelize.define('tbl_device_tablet', {
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
                model: 'tbl_brand_device_tablet',
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
        ram_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_ram',
                key: 'id'
            }
        },
        storage_capacity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_cap_storage',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_tablet',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ChipsetTablet = sequelize.define('tbl_device_tablet_cpu', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tablet_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tablet,
                key: 'id'
            }
        },
        cpu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_part_chipset',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_device_tablet_cpu',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ConnectionsTablet = sequelize.define('tbl_device_tablet_connections', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tablet_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tablet,
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
        tableName: 'tbl_device_tablet_connections',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const PeripheralsTablet = sequelize.define('tbl_device_tablet_peripherals', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tablet_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tablet,
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
        tableName: 'tbl_device_tablet_peripherals',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const CondemnedTablet = sequelize.define('tbl_condemned_tablet', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tablet_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tablet,
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
        tableName: 'tbl_condemned_tablet',
        timestamps: false
    });

    const AuditTabletLocation = sequelize.define('tbl_audit_location_tablet', {
        tablet_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tablet,
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
        tableName: 'tbl_audit_location_tablet',
        timestamps: false
    });

    const AuditTabletConnection = sequelize.define('tbl_audit_connection_tablet', {
        tablet_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tablet,
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
        tableName: 'tbl_audit_location_tablet',
        timestamps: false
    });

    return {
        ChipsetTablet,
        Tablet,
        PeripheralsTablet,
        ConnectionsTablet,
        CondemnedTablet,
        AuditTabletConnection,
        AuditTabletLocation
    };
}
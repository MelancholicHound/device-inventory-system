module.exports = (sequelize, DataTypes) => {
    const ChipsetTablet = sequelize.define('tbl_device_tablet_cpu', {
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
            allowNull: false,
        }
    }, {
        tableName: 'tbl_device_tablet_cpu',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

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
        cpu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: ChipsetTablet,
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
        tableName: 'tbl_device_tablet',
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

    return {
        ChipsetTablet,
        Tablet,
        PeripheralsTablet,
        ConnectionsTablet
    };
}
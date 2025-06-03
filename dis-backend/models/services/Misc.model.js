module.exports = (sequelize, DataTypes) => {
    const PrinterType = sequelize.define('tbl_misc_printer_type', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_misc_printer_type',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const ScannerType = sequelize.define('tbl_misc_scanner_type', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_misc_scanner_type',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const StorageType = sequelize.define('tbl_misc_storage_type', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_misc_storage_type',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const NetworkSpeed = sequelize.define('tbl_misc_net_speed', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        speed_by_mbps: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_misc_net_speed',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const AntennaCount = sequelize.define('tbl_misc_antenna', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true, 
            primaryKey: true
        },
        antenna_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_misc_antenna',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const Connection = sequelize.define('tbl_misc_connection', {
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
        tableName: 'tbl_misc_connection',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const Peripheral = sequelize.define('tbl_misc_peripheral', {
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
        tableName: 'tbl_misc_peripheral',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const SoftwareOS = sequelize.define('tbl_misc_sw_opsystem', {
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
        tableName: 'tbl_misc_sw_opsystem',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const SoftwareProductivity = sequelize.define('tbl_misc_sw_prodtool', {
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
        tableName: 'tbl_misc_sw_opsystem',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const SoftwareSecurity = sequelize.define('tbl_misc_sw_security', {
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
        tableName: 'tbl_misc_sw_security',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return {
        PrinterType,
        ScannerType,
        StorageType,
        NetworkSpeed,
        AntennaCount,
        Connection,
        Peripheral,
        SoftwareOS,
        SoftwareProductivity,
        SoftwareSecurity
    };
}
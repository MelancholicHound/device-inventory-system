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
        timestamps: false
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
        timestamps: false
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
        timestamps: false
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
        timestamps: false
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
        timestamps: false
    });

    return {
        PrinterType,
        ScannerType,
        StorageType,
        NetworkSpeed,
        AntennaCount
    };
}
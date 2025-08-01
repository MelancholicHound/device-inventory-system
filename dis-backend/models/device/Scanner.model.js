module.exports = (sequelize, DataTypes) => {
    const Scanner = sequelize.define('tbl_device_scanner', {
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
                model: 'tbl_brand_device_scanner',
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
        type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_scanner_type',
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
        tableName: 'tbl_device_scanner',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const CondemnedScanner = sequelize.define('tbl_condemned_scanner', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        scanner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Scanner,
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
        tableName: 'tbl_condemned_scanner',
        timestamps: false
    });

    const AuditScannerLocation = sequelize.define('tbl_audit_location_scanner', {
        scanner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Scanner,
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
        tableName: 'tbl_audit_location_printer',
        timestamps: false
    });

    return { 
        Scanner,
        CondemnedScanner,
        AuditScannerLocation 
    };
}
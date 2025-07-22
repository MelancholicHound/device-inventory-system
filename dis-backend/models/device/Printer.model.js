module.exports = (sequelize, DataTypes) => {
    const Printer = sequelize.define('tbl_device_printer', {
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
                model: 'tbl_brand_device_printer',
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
                model: 'tbl_misc_printer_type',
                key: 'id'
            }
        },
        with_scanner: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'tbl_device_printer',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const CondemnedPrinter = sequelize.define('tbl_condemned_printer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        printer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Printer,
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
        tableName: 'tbl_condemned_printer',
        timestamps: false
    });

    const AuditPrinterLocation = sequelize.define('tbl_audit_location_printer', {
        printer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Printer,
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
        tableName: 'tbl_audit_location_router',
        timestamps: false
    });

    return { 
        Printer,
        CondemnedPrinter,
        AuditPrinterLocation 
    };
}
module.exports = (sequelize, DataTypes) => {
    const UPS = sequelize.define('tbl_device_ups', {
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
                model: 'tbl_brand_device_ups',
                key: 'id'
            }
        },
        model: {
            type: DataTypes.STRING
        },
        is_condemned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        volt_amperes: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        accountable_user: {
            type: DataTypes.STRING
        },
        co_accountable_user: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'tbl_device_ups',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const CondemnedUPS = sequelize.define('tbl_condemned_ups', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ups_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UPS,
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
        tableName: 'tbl_condemned_ups',
        timestamps: false
    });

    const AuditUPSLocation = sequelize.define('tbl_audit_location_ups', {
        ups_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UPS,
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
        UPS,
        CondemnedUPS,
        AuditUPSLocation 
    };
}
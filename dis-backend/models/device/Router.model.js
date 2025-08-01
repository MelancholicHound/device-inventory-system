module.exports = (sequelize, DataTypes) => {
    const Router = sequelize.define('tbl_device_router', {
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
                model: 'tbl_brand_device_router',
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
        network_speed_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_net_speed',
                key: 'id'
            }
        },
        antenna_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_misc_antenna',
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
        tableName: 'tbl_device_router',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const CondemnedRouter = sequelize.define('tbl_condemned_router', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        router_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Router,
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
        tableName: 'tbl_condemned_router',
        timestamps: false
    });

    const AuditRouterLocation = sequelize.define('tbl_audit_location_router', {
        router_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Router,
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
        Router,
        CondemnedRouter,
        AuditRouterLocation
    };
}
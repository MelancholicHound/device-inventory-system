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
        volt_amperes: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        }
    }, {
        tableName: 'tbl_device_ups',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return { UPS };
}
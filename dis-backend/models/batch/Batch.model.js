module.exports = (sequelize, DataTypes) => {
    const PurchaseRequestDTO = sequelize.define('tbl_purchase_request', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true 
        },
        number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        file: {
            type: DataTypes.BLOB
        }
    }, {
        tableName: 'tbl_purchase_request',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    const Batch = sequelize.define('tbl_batch', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        batch_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        valid_until: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        date_delivered: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        date_tested: {
            type: DataTypes.DATEONLY
        },
        supplier_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_supplier',
                key: 'id'
            }
        },
        service_center: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prDTO_id: {
            type: DataTypes.INTEGER,
            references: {
                model: PurchaseRequestDTO,
                key: 'id'
            }
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_user',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_batch',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return { PurchaseRequestDTO, Batch };
};

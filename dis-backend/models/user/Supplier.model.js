module.exports = (sequelize, DataTypes) => {
    const Supplier = sequelize.define('tbl_supplier', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cp_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cp_contact_number: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: 'tbl_supplier',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return {
        Supplier
    };
}
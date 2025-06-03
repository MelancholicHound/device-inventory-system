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
            allowNull: false
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
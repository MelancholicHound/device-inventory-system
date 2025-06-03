module.exports = (sequelize, DataTypes) => {
    const CapacityRAM = sequelize.define('tbl_cap_ram', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_cap_ram',
        timestamps: false
    });

    const CapacityStorage = sequelize.define('tbl_cap_storage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_cap_storage',
        timestamps: false
    });

    const CapacityGPU = sequelize.define('tbl_cap_gpu', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tbl_cap_gpu',
        timestamps: false
    });

    return {
        CapacityGPU,
        CapacityRAM,
        CapacityStorage
    };
}
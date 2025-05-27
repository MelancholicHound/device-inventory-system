module.exports = (sequelize, DataTypes) => {
    const Division = sequelize.define('tbl_loc_division', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'tbl_loc_division',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    const Section = sequelize.define('tbl_loc_section', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        div_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Division,
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_loc_section',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    const User = sequelize.define('tbl_user', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
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
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'tbl_user',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return {
        Division,
        Section,
        User
    };
}
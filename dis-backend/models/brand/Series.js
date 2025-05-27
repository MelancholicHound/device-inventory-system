module.exports = (sequelize, DataTypes) => {
    const BrandSeriesProcessor = sequelize.define('tbl_brand_processor_series', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: false,
            primaryKey: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false, 
            references: {
                model: 'tbl_brand_processor',
                key: 'id'
            }
        }
    }, {
        tableName: 'tbl_brand_processor_series',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return BrandSeriesProcessor;
}
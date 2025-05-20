const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const User = sequelize.define('tbl_user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
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
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Division = sequelize.define('tbl_loc_divisions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        onDelete: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

const Section = sequelize.define('tbl_loc_sections', {
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
});



sequelize.sync({ alter: true })
.then(async () => {
    const countDivision = await Division.count();
    const countSection = await Section.count();

    if (countDivision === 0) {
        await Division.bulkCreate([
            { name: 'Allied Health and Professional Services' },
            { name: 'Finance' },
            { name: 'Hospital Operations and Patient Support Service' },
            { name: 'Medical' },
            { name: 'Nursing' },
            { name: 'Under MCC' },
            { name: 'Others' }
        ]);
    }

    const allied = await Division.findOne({ where: { name: 'Allied Health and Professional Services' } });
    const finance = await Division.findOne({ where: { name: 'Finance' } });
    const hopss = await Division.findOne({ where: { name: 'Hospital Operations and Patient Support Service' } });
    const medical = await Division.findOne({ where: { name: 'Medical' } });
    const nursing = await Division.findOne({ where: { name: 'Nursing' } });
    const underMCC = await Division.findOne({ where: { name: 'Under MCC' } });
    const others = await Division.findOne({ where: { name: 'Others' } });

    if (countSection === 0) {
        await Section.bulkCreate([
            { name: '2D ECHO', division_id: nursing.dataValues?.id },
            { name: 'ACCOUNTING', division_id: finance.dataValues?.id },
            { name: 'ADMITTING', division_id: allied.dataValues?.id },
            { name: 'ANATOMIC LABORATORY (HISTOPATH)', division_id: medical.dataValues?.id },
            { name: 'ANESTHESIA OFFICE', division_id: medical.dataValues?.id },
            { name: 'AUDITORIUM', division_id: hopss.dataValues?.id },
            { name: 'BAC', division_id: hopss.dataValues?.id },
            { name: 'BILLING', division_id: finance.dataValues?.id },
            { name: 'BLOODBANK', division_id: medical.dataValues?.id },
            { name: 'BREASTFEEDING ROOM', division_id: nursing.dataValues?.id },
            { name: 'BUDGET', division_id: finance.dataValues?.id },
            { name: 'CASHIER', division_id: finance.dataValues?.id },
            { name: 'CLAIMS', division_id: finance.dataValues?.id },
            { name: 'CLINICAL LABORATORY', division_id: medical.dataValues?.id },
            { name: 'CMPS', division_id: medical.dataValues?.id },
            { name: 'COA', division_id: others.dataValues?.id },
            { name: 'COOP', division_id: others.dataValues?.id },
            { name: 'CSR', division_id: nursing.dataValues?.id },
            { name: 'DENTAL', division_id: medical.dataValues?.id },
            { name: 'DIALYSIS', division_id: medical.dataValues?.id },
            { name: 'DIETARY CONFERENCE', division_id: allied.dataValues?.id },
            { name: 'DR', division_id: nursing.dataValues?.id },
            { name: 'ECG', division_id: nursing.dataValues?.id },
            { name: 'EINC', division_id: nursing.dataValues?.id },
            { name: 'ENDOSCOPY', division_id: nursing.dataValues?.id },
            { name: 'ENGINEERING', division_id: hopss.dataValues?.id },
            { name: 'ORLNHS', division_id: medical.dataValues?.id },
            { name: 'ER', division_id: medical.dataValues?.id },
            { name: 'ER-OB', division_id: medical.dataValues?.id },
            { name: 'ER-XRAY', division_id: medical.dataValues?.id },
            { name: 'FAMILY MEDICINE', division_id: medical.dataValues?.id },
            { name: 'FEMALE MEDICAL WARD', division_id: nursing.dataValues?.id },
            { name: 'FEMALE SURGICAL WARD', division_id: nursing.dataValues?.id },
            { name: 'FINANCE', division_id: finance.dataValues?.id },
            { name: 'ENGINEERING-GENERAL SERVICES', division_id: finance.dataValues?.id },
            { name: 'HEMODIALYSIS', division_id: nursing.dataValues?.id },
            { name: 'HIRMS-MAIN', division_id: allied.dataValues?.id },
            { name: 'HIRMS-ORU', division_id: allied.dataValues?.id },
            { name: 'CAO OFFICE', division_id: hopss.dataValues?.id },
            { name: 'HRMO-MAIN', division_id: hopss.dataValues?.id },
            { name: 'HRMO-EXTENSION', division_id: hopss.dataValues?.id },
            { name: 'ICU', division_id: nursing.dataValues?.id },
            { name: 'IMISS', division_id: hopss.dataValues?.id },
            { name: 'IMAGING-REGISTRATION', division_id: medical.dataValues?.id },
            { name: 'IMAGING-ER XRAY', division_id: medical.dataValues?.id },
            { name: 'IMAGING-RELEASING', division_id: medical.dataValues?.id },
            { name: 'IMAGING-CITISCAN', division_id: medical.dataValues?.id },
            { name: 'IMAGING-OPD', division_id: medical.dataValues?.id },
            { name: 'IPCC', division_id: others.dataValues?.id },
            { name: 'IRB', division_id: underMCC.dataValues?.id },
            { name: 'PACD', division_id: underMCC.dataValues?.id },
            { name: 'LEGAL', division_id: underMCC.dataValues?.id },
            { name: 'MEDICAL WARD', division_id: nursing.dataValues?.id },
            { name: 'SURGICAL WARD', division_id: nursing.dataValues?.id },
            { name: 'MATERIALS MANAGEMENT SECTION', division_id: hopss.dataValues?.id },
            { name: 'MCC OFFICE', division_id: underMCC.dataValues?.id },
            { name: 'MEDICAL SOCIAL SERVICE-MAIN', division_id: allied.dataValues?.id },
            { name: 'MEDICAL SOCIAL SERVICE-ER GF', division_id: allied.dataValues?.id },
            { name: 'MEDICAL SOCIAL SERVICE-3RD FL 6STOREY', division_id: allied.dataValues?.id },
            { name: 'MEDICINE', division_id: medical.dataValues?.id },
            { name: 'NICU', division_id: nursing.dataValues?.id },
            { name: 'NURSING OFFICE', division_id: nursing.dataValues?.id },
            { name: 'NURSING TRAINING', division_id: nursing.dataValues?.id },
            { name: 'NUTRITION AND DIETETICS', division_id: allied.dataValues?.id },
            { name: 'OB OFFICE', division_id: medical.dataValues?.id },
            { name: 'OB WARD', division_id: nursing.dataValues?.id },
            { name: 'ONCOLOGY', division_id: nursing.dataValues?.id },
            { name: 'OPD CASHIER', division_id: finance.dataValues?.id },
            { name: 'OPD-DENTAL', division_id: medical.dataValues?.id },
            { name: 'OPD-FAMILY PLANNING', division_id: medical.dataValues?.id },
            { name: 'OPD-LAB', division_id: medical.dataValues?.id },
            { name: 'OPD-MEDICINE', division_id: medical.dataValues?.id },
            { name: 'OPD-OB', division_id: medical.dataValues?.id },
            { name: 'OPD-PEDIA', division_id: medical.dataValues?.id },
            { name: 'PHARMACY-MAIN', division_id: allied.dataValues?.id },
            { name: 'PHARMACY-ER', division_id: allied.dataValues?.id },
            { name: 'OPD-SURGERY', division_id: medical.dataValues?.id },
            { name: 'OPERATING ROOM', division_id: medical.dataValues?.id },
            { name: 'OPTHA OFFICE', division_id: medical.dataValues?.id },
            { name: 'OR COMPLEX', division_id: medical.dataValues?.id },
            { name: 'ORTHO OFFICE', division_id: medical.dataValues?.id },
            { name: 'OSM', division_id: medical.dataValues?.id },
            { name: 'PACU', division_id: nursing.dataValues?.id },
            { name: 'PEDIA OFFICE', division_id: medical.dataValues?.id },
            { name: 'PEDIA QUARTERS', division_id: medical.dataValues?.id },
            { name: 'PEDIA WARD', division_id: nursing.dataValues?.id },
            { name: 'EMPLOYEES WARD', division_id: nursing.dataValues?.id },
            { name: 'PHILHEALTH-EXPRESS', division_id: finance.dataValues?.id },
            { name: 'POC-NBB', division_id: finance.dataValues?.id },
            { name: 'PROCUREMENT', division_id: hopss.dataValues?.id },
            { name: 'PHU', division_id: underMCC.dataValues?.id },
            { name: 'QMU', division_id: underMCC.dataValues?.id },
            { name: 'REHAB', division_id: medical.dataValues?.id },
            { name: 'RDU', division_id: underMCC.dataValues?.id },
            { name: 'SANCTUARIO DE PAULINO', division_id: medical.dataValues?.id },
            { name: 'SICU', division_id: nursing.dataValues?.id },
            { name: 'OPD HEAD OFFICE', division_id: nursing.dataValues?.id },
            { name: 'SURGERY', division_id: medical.dataValues?.id },
            { name: 'TB-DOTS', division_id: others.dataValues?.id },
            { name: 'TELEHEALTH', division_id: medical.dataValues?.id },
            { name: 'MULTISPECIALTY CENTER', division_id: medical.dataValues?.id } 
        ]);
    }

    console.log('Table created successfully.');
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { User, Division, Section };
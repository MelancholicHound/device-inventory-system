const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./database.services');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

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
});

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
        allowNull: false
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
            model: User,
            key: 'id'
        }
    }
});

sequelize.sync({ alter: true })
.then(async () => {
    const countDivision = await Division.count();
    const countSection = await Section.count();

    if (countDivision == 0) {
        await Division.bulkCreate([
            { name: 'ALLIED HEALTH AND PROFESSIONAL SERVICES' },
            { name: 'FINANCE' },
            { name: 'HOSPITAL OPERATIONS AND PATIENT SUPPORT SERVICE' },
            { name: 'MEDICAL' },
            { name: 'NURSING' },
            { name: 'UNDER MCC' },
            { name: 'OTHERS' }
        ]);
    }

    const allied = await Division.findOne({ where: { name: 'ALLIED HEALTH AND PROFESSIONAL SERVICES' } });
    const finance = await Division.findOne({ where: { name: 'FINANCE' } });
    const hopss = await Division.findOne({ where: { name: 'HOSPITAL OPERATIONS AND PATIENT SUPPORT SERVICE' } });
    const medical = await Division.findOne({ where: { name: 'MEDICAL' } });
    const nursing = await Division.findOne({ where: { name: 'NURSING' } });
    const underMCC = await Division.findOne({ where: { name: 'UNDER MCC' } });
    const others = await Division.findOne({ where: { name: 'OTHERS' } });

    if (countSection == 0) {
        await Section.bulkCreate([
            { name: '2D ECHO', div_id: nursing.dataValues?.id },
            { name: 'ACCOUNTING', div_id: finance.dataValues?.id },
            { name: 'ADMITTING', div_id: allied.dataValues?.id },
            { name: 'ANATOMIC LABORATORY (HISTOPATH)', div_id: medical.dataValues?.id },
            { name: 'ANESTHESIA OFFICE', div_id: medical.dataValues?.id },
            { name: 'AUDITORIUM', div_id: hopss.dataValues?.id },
            { name: 'BAC', div_id: hopss.dataValues?.id },
            { name: 'BILLING', div_id: finance.dataValues?.id },
            { name: 'BLOODBANK', div_id: medical.dataValues?.id },
            { name: 'BREASTFEEDING ROOM', div_id: nursing.dataValues?.id },
            { name: 'BUDGET', div_id: finance.dataValues?.id },
            { name: 'CASHIER', div_id: finance.dataValues?.id },
            { name: 'CLAIMS', div_id: finance.dataValues?.id },
            { name: 'CLINICAL LABORATORY', div_id: medical.dataValues?.id },
            { name: 'CMPS', div_id: medical.dataValues?.id },
            { name: 'COA', div_id: others.dataValues?.id },
            { name: 'COOP', div_id: others.dataValues?.id },
            { name: 'CSR', div_id: nursing.dataValues?.id },
            { name: 'DENTAL', div_id: medical.dataValues?.id },
            { name: 'DIALYSIS', div_id: medical.dataValues?.id },
            { name: 'DIETARY CONFERENCE', div_id: allied.dataValues?.id },
            { name: 'DR', div_id: nursing.dataValues?.id },
            { name: 'ECG', div_id: nursing.dataValues?.id },
            { name: 'EINC', div_id: nursing.dataValues?.id },
            { name: 'ENDOSCOPY', div_id: nursing.dataValues?.id },
            { name: 'ENGINEERING', div_id: hopss.dataValues?.id },
            { name: 'ORLNHS', div_id: medical.dataValues?.id },
            { name: 'ER', div_id: medical.dataValues?.id },
            { name: 'ER-OB', div_id: medical.dataValues?.id },
            { name: 'ER-XRAY', div_id: medical.dataValues?.id },
            { name: 'FAMILY MEDICINE', div_id: medical.dataValues?.id },
            { name: 'FEMALE MEDICAL WARD', div_id: nursing.dataValues?.id },
            { name: 'FEMALE SURGICAL WARD', div_id: nursing.dataValues?.id },
            { name: 'FINANCE', div_id: finance.dataValues?.id },
            { name: 'ENGINEERING-GENERAL SERVICES', div_id: finance.dataValues?.id },
            { name: 'HEMODIALYSIS', div_id: nursing.dataValues?.id },
            { name: 'HIRMS-MAIN', div_id: allied.dataValues?.id },
            { name: 'HIRMS-ORU', div_id: allied.dataValues?.id },
            { name: 'CAO OFFICE', div_id: hopss.dataValues?.id },
            { name: 'HRMO-MAIN', div_id: hopss.dataValues?.id },
            { name: 'HRMO-EXTENSION', div_id: hopss.dataValues?.id },
            { name: 'ICU', div_id: nursing.dataValues?.id },
            { name: 'IMISS', div_id: hopss.dataValues?.id },
            { name: 'IMAGING-REGISTRATION', div_id: medical.dataValues?.id },
            { name: 'IMAGING-ER XRAY', div_id: medical.dataValues?.id },
            { name: 'IMAGING-RELEASING', div_id: medical.dataValues?.id },
            { name: 'IMAGING-CITISCAN', div_id: medical.dataValues?.id },
            { name: 'IMAGING-OPD', div_id: medical.dataValues?.id },
            { name: 'IPCC', div_id: others.dataValues?.id },
            { name: 'IRB', div_id: underMCC.dataValues?.id },
            { name: 'PACD', div_id: underMCC.dataValues?.id },
            { name: 'LEGAL', div_id: underMCC.dataValues?.id },
            { name: 'MEDICAL WARD', div_id: nursing.dataValues?.id },
            { name: 'SURGICAL WARD', div_id: nursing.dataValues?.id },
            { name: 'MATERIALS MANAGEMENT SECTION', div_id: hopss.dataValues?.id },
            { name: 'MCC OFFICE', div_id: underMCC.dataValues?.id },
            { name: 'MEDICAL SOCIAL SERVICE-MAIN', div_id: allied.dataValues?.id },
            { name: 'MEDICAL SOCIAL SERVICE-ER GF', div_id: allied.dataValues?.id },
            { name: 'MEDICAL SOCIAL SERVICE-3RD FL 6STOREY', div_id: allied.dataValues?.id },
            { name: 'MEDICINE', div_id: medical.dataValues?.id },
            { name: 'NICU', div_id: nursing.dataValues?.id },
            { name: 'NURSING OFFICE', div_id: nursing.dataValues?.id },
            { name: 'NURSING TRAINING', div_id: nursing.dataValues?.id },
            { name: 'NUTRITION AND DIETETICS', div_id: allied.dataValues?.id },
            { name: 'OB OFFICE', div_id: medical.dataValues?.id },
            { name: 'OB WARD', div_id: nursing.dataValues?.id },
            { name: 'ONCOLOGY', div_id: nursing.dataValues?.id },
            { name: 'OPD CASHIER', div_id: finance.dataValues?.id },
            { name: 'OPD-DENTAL', div_id: medical.dataValues?.id },
            { name: 'OPD-FAMILY PLANNING', div_id: medical.dataValues?.id },
            { name: 'OPD-LAB', div_id: medical.dataValues?.id },
            { name: 'OPD-MEDICINE', div_id: medical.dataValues?.id },
            { name: 'OPD-OB', div_id: medical.dataValues?.id },
            { name: 'OPD-PEDIA', div_id: medical.dataValues?.id },
            { name: 'PHARMACY-MAIN', div_id: allied.dataValues?.id },
            { name: 'PHARMACY-ER', div_id: allied.dataValues?.id },
            { name: 'OPD-SURGERY', div_id: medical.dataValues?.id },
            { name: 'OPERATING ROOM', div_id: medical.dataValues?.id },
            { name: 'OPTHA OFFICE', div_id: medical.dataValues?.id },
            { name: 'OR COMPLEX', div_id: medical.dataValues?.id },
            { name: 'ORTHO OFFICE', div_id: medical.dataValues?.id },
            { name: 'OSM', div_id: medical.dataValues?.id },
            { name: 'PACU', div_id: nursing.dataValues?.id },
            { name: 'PEDIA OFFICE', div_id: medical.dataValues?.id },
            { name: 'PEDIA QUARTERS', div_id: medical.dataValues?.id },
            { name: 'PEDIA WARD', div_id: nursing.dataValues?.id },
            { name: 'EMPLOYEES WARD', div_id: nursing.dataValues?.id },
            { name: 'PHILHEALTH-EXPRESS', div_id: finance.dataValues?.id },
            { name: 'POC-NBB', div_id: finance.dataValues?.id },
            { name: 'PROCUREMENT', div_id: hopss.dataValues?.id },
            { name: 'PHU', div_id: underMCC.dataValues?.id },
            { name: 'QMU', div_id: underMCC.dataValues?.id },
            { name: 'REHAB', div_id: medical.dataValues?.id },
            { name: 'RDU', div_id: underMCC.dataValues?.id },
            { name: 'SANCTUARIO DE PAULINO', div_id: medical.dataValues?.id },
            { name: 'SICU', div_id: nursing.dataValues?.id },
            { name: 'OPD HEAD OFFICE', div_id: nursing.dataValues?.id },
            { name: 'SURGERY', div_id: medical.dataValues?.id },
            { name: 'TB-DOTS', div_id: others.dataValues?.id },
            { name: 'TELEHEALTH', div_id: medical.dataValues?.id },
            { name: 'MULTISPECIALTY CENTER', div_id: medical.dataValues?.id } 
        ]);
    }

    console.log('Table created successfully.');
})
.catch((error) => console.log('Error creating table: ', error));

module.exports = { User, Batch, PurchaseRequestDTO };

const { Sequelize, DataTypes } = require('sequelize');

const { Section, Batch } = require('../util/database.user');
const { Motherboard, Processor } = require('../util/database.components');
const { UPS } = require('../util/database.device-ups');
const { RAM, Storage, GPUQuantity } = require('../util/database.capacities');
const { BrandAIO } = require('../util/database.brands');
const { ConnectionsDTO, OperatingSystemDTO, SecurityDTO, ProductivityTool, PeripheralsDTO } = require('./database.services');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const SoftwaresAIO = sequelize.define('tbl_softwares_aio', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    os_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: OperatingSystemDTO,
            key: 'id'
        }
    },
    pt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ProductivityTool,
            key: 'id'
        }
    },
    security_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            model: SecurityDTO,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const PeripheralsAIO = sequelize.define('tbl_peripherals_aio', {
    aio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AIO,
            key: 'id'
        }
    },
    peripheral_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PeripheralsDTO,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const ConnectionsAIO = sequelize.define('tbl_connections_aio', {
    aio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AIO,
            key: 'id'
        }
    },
    connection_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ConnectionsDTO,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const AIO = sequelize.define('tbl_device_aio', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    batch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Batch,
            key: 'id'
        }
    },
    device_tag: {
        type: DataTypes.STRING,
        allowNull: false
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Section,
            key: 'id'
        }
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: BrandAIO,
            key: 'id'
        }
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serial_number: {
        type: DataTypes.STRING,
        unique: true
    },
    is_condemned: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    ups_id: {
        type: DataTypes.INTEGER,
        references: {
            model: UPS,
            key: 'id'
        }
    },
    screen_size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cpu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Processor,
            key: 'id'
        }
    },
    softwares_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SoftwaresAIO,
            key: 'id'
        }
    },
    gpu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: GPUQuantity,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const RAMAIO = sequelize.define('tbl_ram_aio', {
    aio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AIO,
            key: 'id'
        }
    },
    ram_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RAM,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const StorageAIO = sequelize.define('tbl_storage_aio', {
    aio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AIO,
            key: 'id'
        }
    },
    storage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Storage,
            key: 'id'
        }
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

sequelize.sync({ alter: true })
.catch((error) => console.log('Error creating table: ', error));

module.exports = {
    RAMAIO,
    StorageAIO,
    AIO,
    ConnectionsAIO,
    PeripheralsAIO,
    SoftwaresAIO
};
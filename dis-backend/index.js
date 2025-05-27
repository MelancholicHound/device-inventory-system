const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const { errorHandler } = require('./controllers/error');
const seedBrandData = require('./seeds/seeder.brand');
const seedUserData = require('./seeds/seeder.user');
const { 
    BrandAIO, 
    BrandLaptop, 
    BrandPrinter, 
    BrandRouter, 
    BrandScanner, 
    BrandTablet, 
    BrandUPS, 
    Section, 
    Division,
    User,
    PurchaseRequestDTO,
    sequelize 
} = require('./models/index');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

sequelize.sync({ alter: true })
.then(async() => {
    await seedBrandData({ BrandAIO, BrandLaptop, BrandPrinter, BrandRouter, BrandScanner, BrandTablet, BrandUPS });
    await seedUserData({ Section, Division });
})
.catch((error) => console.error('Sync error: ', error));

app.use(cors());
app.use(bodyParser.json());

app.use('/app/auth', authRoutes);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(errorHandler);

app.listen(port, () => console.log(`Listening to port ${port}`));
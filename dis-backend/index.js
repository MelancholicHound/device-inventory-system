const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const { errorHandler } = require('./controllers/error');
const { initDB } = require('./models/index');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

initDB();

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
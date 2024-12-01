const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config({ path: './src/.env' });

const reservationRoute = require('./routes/reservation-route');
const userRoute = require('./routes/user-route');
const priceRoute = require('./routes/prices-route');
const recordRoute = require('./routes/record-route');
const paymongoRoute = require('./routes/paymongo/paymongo-route');
const salesRoute = require('./routes/sales-route');
const membersRoute = require('./routes/members-route');
const paymentRoute = require('./routes/payment-route');
const smsRoute = require('./routes/sms-route');
const voucherRoute =require('./routes/voucher-route');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/reservations', reservationRoute);
app.use('/api/users', userRoute);
app.use('/api/prices', priceRoute);
app.use('/api/records', recordRoute);
app.use('/api/paymongo', paymongoRoute);
app.use('/api/sales', salesRoute);
app.use('/api/members', membersRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/sms', smsRoute);
app.use('/api/vouchers', voucherRoute);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,   
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port:3306
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

app.set('db', db);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

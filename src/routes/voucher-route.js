const express = require('express');
const voucherRoute = express.Router();

voucherRoute.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
})

voucherRoute.get('/onehour', async (req, res) => {
    const db = req.db;
    const query = `SELECT * FROM onehour WHERE status = 0`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    } )
})

voucherRoute.get('/threehours', async (req, res) => {
    const db = req.db;
    const query = `SELECT * FROM threehours WHERE status = 0`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    } )
})

voucherRoute.get('/fivehours', async (req, res) => {
    const db = req.db;
    const query = `SELECT * FROM fivehours WHERE status = 0`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    } )
})

voucherRoute.get('/wholeday', async (req, res) => {
    const db = req.db;
    const query = `SELECT * FROM wholeday WHERE status = 0`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    } )
})

voucherRoute.delete('/onehour/:id', async (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const query = `DELETE FROM onehour WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Voucher deleted successfully', result })
    })
})

voucherRoute.delete('/threehours/:id', async (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const query = `DELETE FROM threehours WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Voucher deleted successfully', result })
    })
})

voucherRoute.delete('/fivehours/:id', async (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const query = `DELETE FROM fivehours WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Voucher deleted successfully', result })
    })
})

voucherRoute.delete('/wholeday/:id', async (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const query = `DELETE FROM wholeday WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Voucher deleted successfully', result })
    })
})



module.exports = voucherRoute;
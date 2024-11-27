const express = require('express');
const paymentRoute = express.Router();

paymentRoute.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
})

paymentRoute.get('/:userID', async (req, res) => {
    const db = req.db;
    const id = req.params.userID;
    const query = 'SELECT * FROM payments WHERE userID = ?';
    db.query(query, [id], (err, result) => {
        if (err) throw (err);
        res.json(result);
    })
})

paymentRoute.post('/', async (req, res) => {
    const db = req.db;
    const { userID, sourceID, payID, recordID, amount, contact } = req.body;
    const query = 'INSERT INTO payments (userID, sourceID, payID, recordID, amount, contact) VALUE (?, ?, ? ,?, ? , ?)';
    db.query(query, [ userID, sourceID, payID, recordID, amount, contact ], (err, result) => {
        if (err) throw(err);
        res.json(result);
    })
})

paymentRoute.put('/:userID', async (req, res) => {
    const db = req.db;
    const userID = req.params.userID;
    const inputData = req.body;
    const query = 'UPDATE payments SET ? WHERE id = ?';
    db.query(query, [inputData, userID], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'User updated successfully!', result });
    });
});

paymentRoute.delete('/:userID', async (req, res) => {
    const db = req.db;
    const userID = req.params.userID;
    const query = 'DELETE FROM payments WHERE userID = ?';
    db.query(query, [userID], (err, result) => {
        if (err) throw (err);
        res.json({ message: 'Data deleted...', result });
    })
})

module.exports = paymentRoute;
const express = require('express');
const resRouter = express.Router();

resRouter.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
});

resRouter.get('/', async (req, res) => {
    const db = req.db;
    db.query('SELECT * FROM reservations', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

resRouter.post('/', (req, res) => {
    const db = req.db;
    const { id, name, date, time, duration, service, status, userid, amount } = req.body;
    const sqlInsert = 'INSERT INTO reservations (id, name, date, time, duration, service, status, userid, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sqlInsert, [id, name, date, time, duration, service, status, userid, amount], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'Reservation created successfully!', reservationId: result.insertId });
    });
});

resRouter.delete('/:id', async (req, res) => {
    const db = req.db;
    const userID = req.params.id;
    const query = 'DELETE FROM reservations WHERE id = ?';

    db.query(query, [userID], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'Reservation deleted successfully!', result });
    });
});

resRouter.get('/:userid', async (req, res) => {
    const db = req.db; 
    const userID = req.params.userid; 
    const query = 'SELECT * FROM reservations WHERE userid = ?';

    db.query(query, [userID], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('Status not found');
        } 
        res.json(results);
    });
});

resRouter.put('/:id', async (req, res) => {
    const db = req.db;
    const userID = req.params.id;
    const inputData = req.body;
    const query = 'UPDATE reservations SET ? WHERE id = ?';
    db.query(query, [inputData, userID], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'User updated successfully!', result });
    });
})

resRouter.get('/id/:id', async (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const query = 'SELECT * FROM reservations WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('Reserve ID not found');
        }
        res.json(results);
    });
});

resRouter.get('/calendar/list', async (req, res) => {
    const db = req.db;
    const query = 'SELECT * FROM reservations WHERE status = "Approved"';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

resRouter.get('/service/:service', async (req, res) => {
    const db = req.db;
    const service = req.params.service
    const query = 'SELECT * FROM reservations WHERE service = ?';
    db.query(query, [service], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    })
})

module.exports = resRouter;
const express = require('express');
const priceRoute = express.Router();

priceRoute.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
})

priceRoute.get('/', async (req, res) =>{
    const db = req.db;
    const query = 'SELECT * FROM prices';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

priceRoute.get('/service/:service', async (req, res) => {
    const db = req.db;
    const serviceName = req.params.service;
    const query = 'SELECT * FROM prices WHERE service = ?';

    db.query(query, [serviceName], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('Service not found');
        }
        res.json(results);
    });
});

priceRoute.get('/id/:idprices', async (req, res) => {
    const db = req.db;
    const idName = req.params.idprices;
    const query = 'SELECT * FROM prices WHERE idprices = ?';

    db.query(query, [idName], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('ID not found');
        }
        res.json(results);
    });
});

priceRoute.get('/sit:service', async (req,res) => {
    const db = req.db;
    const service = req.params.service;
    const query = 'SELECT available FROM prices WHERE service = ?'
    db.query(query, [service], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

priceRoute.get('/active:service', async (req,res) =>{
    const db = req.db;
    const service = req.params.service;
    const query = 'SELECT COUNT(status) as TotalActive FROM records WHERE status = "Active" AND service = ?';
    db.query(query, [service], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    })
})

priceRoute.get('/membership:service', async (req, res) =>{
    const db = req.db;
    const service = req.params.service;
    const query = 'SELECT amount FROM prices WHERE service = ?';
    db.query(query, [service], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    })
})

priceRoute.put('/updatePrice:id', (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const inputData = req.body;
    const query = 'UPDATE prices SET ? WHERE idprices = ?';
    db.query(query, [inputData, id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({message: 'Price Updated successfully', results });
    })
})

priceRoute.get('/getExcess:service', (req, res) => {
    const db = req.db;
    const service = req.params.service;
    const query = 'SELECT service, excess FROM prices WHERE service = ?';
    db.query(query, [service], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    })
})

priceRoute.put('/updateExcess:service', (req, res) => {
    const db = req.db;
    const id = req.params.service;
    const inputData = req.body;
    const query = 'UPDATE prices SET ? WHERE service = ?';
    db.query(query, [inputData, id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({message: 'Price Updated successfully', results });
    })
})

module.exports = priceRoute;
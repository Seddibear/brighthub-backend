const express = require('express');
const salesRoute = express.Router();

salesRoute.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
});

salesRoute.get('/report/:date', async (req, res) => {
    const db = req.db;
    const date = req.params.date;
    const query = 'SELECT * FROM records WHERE date = ? AND status = "Paid"';
    db.query(query, [date], (err, results) => {
        if(err) return res.status(500).send(err);
        res.json(results);
    })
})

salesRoute.get('/year:year', async (req, res) => {
    const db = req.db;
    const year = req.params.year;
    const query = 'SELECT SUM(excessAmount) AS totalAmount FROM records WHERE YEAR(date) = ? AND status = "Paid"';
    db.query(query, [year], (err, results) => {
        if(err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

salesRoute.get('/month:month/:year', async (req, res) => {
    const db = req.db;
    const month = req.params.month;
    const year = req.params.year;
    const query = 'SELECT SUM(excessAmount) AS totalAmount FROM records WHERE MONTH(date) = ? AND YEAR(date) = ? AND status = "Paid"';
    db.query(query, [month, year], (err, results) => {
        if(err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

salesRoute.get('/week:date/:year', async (req, res) => {
    const db = req.db;
    const date = req.params.date;
    const year = req.params.year;
    const query = 'SELECT SUM(excessAmount) AS totalAmount FROM records WHERE WEEK(date, 1) = WEEK(?, 1) AND YEAR(date) = ? AND status = "Paid"';
    db.query(query, [date, year], (err, results) => {
        if(err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

salesRoute.get('/daily:date', async (req, res) => {
    const db = req.db;
    const date = req.params.date;
    const query = 'SELECT SUM(excessAmount) AS totalAmount FROM records WHERE date = ? AND status = "Paid"';
    db.query(query, [date], (err, results) => {
        if(err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

salesRoute.get('/salesMonths:year', async (req, res) => {
    const db = req.db;
    const year = req.params.year;
    const query = 'SELECT MONTH(date) AS month, SUM(excessAmount) AS totalAmount FROM records WHERE status = "Paid" AND YEAR(date) = ? GROUP BY YEAR(date), MONTH(date) ORDER BY YEAR(date), MONTH(date);';
    db.query(query, [year], (err, results) => {
        if(err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

salesRoute.get('/salesWeeks/:year/:month', async (req, res) => {
    const db = req.db;
    const year = req.params.year;
    const month = req.params.month;
    const query = 'SELECT WEEK(date, 1) AS week, SUM(excessAmount) AS totalAmount FROM records WHERE status = "Paid" AND YEAR(date) = ? AND MONTH(date) = ? GROUP BY YEAR(date), WEEK(date, 1) ORDER BY YEAR(date), WEEK(date, 1);';
    db.query(query, [year, month], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

module.exports = salesRoute;
const express = require('express');
const recordRoute = express.Router();
const cron = require('node-cron');
const axios = require('axios');
const database = require('./db');
const SEMAPHORE_API_KEY = process.env.SEMA_KEY;


recordRoute.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
});

recordRoute.get('/', async (req, res) => {
    const db = req.db;
    const query = 'SELECT * FROM records';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

recordRoute.post('/login', async (req, res) => {
    const { id, password } = req.body;

    // Query the database for the user by ID
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];

        // Verify password (consider using bcrypt.compare if passwords are hashed)
        const isPasswordValid = user.password === password; // Replace with bcrypt if hashing
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT with user info
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send token and user role in response
        res.json({ token, role: user.role });
    });
});

recordRoute.get('/:id', async (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const query = 'SELECT * FROM records WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('No Record Found!');
        }
        res.json(results);
    });
});

recordRoute.get('/user/:userID', async (req, res) => {
    const db = req.db;
    const id = req.params.userID;
    const query = 'SELECT * FROM records WHERE userID = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('No Record Found!');
        }
        res.json(results);
    });
});

recordRoute.get('/sales/all', async (req, res) => {
    const db = req.db;
    const query = `
                SELECT name, service, duration, date, excessAmount, status, time
                FROM records
                WHERE status = 'Paid'`;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
})

let clients = [];

recordRoute.get('/load/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('event: message\n');
    res.write(`data: Connected\n\n`);
    clients.push(res);
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

recordRoute.post('/', (req, res) => {
    const db = req.db;
    const { id, name, service, duration, amount, status, date, time, userID, contact, endTime } = req.body;
    const query = 'INSERT INTO records (id, name, service, duration, amount, status, date, time, userID, contact, endTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [id, name, service, duration, amount, status, date, time, userID, contact, endTime], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        clients.forEach(client => {
            client.write('event: insertRecord\n');
            client.write(`data: Record ${id} inserted\n\n`);
        });
        res.json({ message: 'Records added Successfully!', results });
    });
});

recordRoute.put('/:id', async (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const inputData = req.body;
    const query = 'UPDATE records SET ? WHERE id = ?';
    db.query(query, [inputData, id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        clients.forEach(client => {
            client.write('event: recordUpdated\n');
            client.write(`data: Record ${id} updated\n\n`);
        });
        res.json({ message: 'Record Updated Successfully', results });
    });
});

recordRoute.put('/update-notified-status/:id', (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const { notified } = req.body;
    const sql = 'UPDATE records SET notified = ? WHERE id = ?';
    db.query(sql, [notified, id], (err, result) => {
        if (err) throw err;
        res.send({ message: 'Notified status updated' });
    });
});

recordRoute.get('/getPayid/:payID', async (req, res) => {
    const db = req.db;
    const id = req.params.payID;
    const query = 'SELECT * FROM records WHERE payID = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw (err);
        res.json(results[0]);
    })
})

recordRoute.get('/count/Desk', async (req, res) => {
    const db = req.db;
    const query = `SELECT COUNT(*) AS count FROM records WHERE service = 'Desk' AND status = 'active'`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    })
})

recordRoute.get('/count/Drafting', async (req, res) => {
    const db = req.db;
    const query = `SELECT COUNT(*) AS count FROM records WHERE service = 'Drafting Table' AND status = 'active'`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    })
})

recordRoute.get('/count/Meeting', async (req, res) => {
    const db = req.db;
    const query = `SELECT COUNT(*) AS count FROM records WHERE service = 'Meeting Room' AND status = 'active'`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    })
})

cron.schedule('* * * * *', async () => {
    try {
        // Fetch records that need notifications
        const [records] = await database.query(`
            SELECT * FROM records
            WHERE notified = false
            AND endTime <= DATE_ADD(NOW(), INTERVAL 5 MINUTE)
            AND endTime > NOW() AND status = "Active"
        `);
        for (const record of records) {
            try {
                // Send SMS if the countdown is within 5 minutes
                const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
                    apikey: SEMAPHORE_API_KEY,
                    number: record.contact,
                    message: `Your time in Brighthub is about to finish.`,
                    sendername: "BrightHub"
                });

                console.log('SMS sent successfully:', response.data);

                // Update the record as notified to prevent duplicate notifications
                await database.query(`
                    UPDATE records SET notified = true WHERE id = ?
                    `, [record.id]);

            } catch (error) {
                console.error('Error sending SMS:', error.message);
                // Handle error but allow the cron job to continue with other records
            }
        }

    } catch (error) {
        console.error('Error in SMS notification cron job:', error.message);
    }
});

module.exports = recordRoute;
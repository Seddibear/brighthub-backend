const express = require('express');
const userRoute = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 

userRoute.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
});

userRoute.get('/', async (req, res) => {
    const db = req.db;
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

userRoute.post('/login', async (req, res) => {
    const { id, password } = req.body;
    const db = req.db;
    // Query the database for the user by ID
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];

        // Verify password (consider using bcrypt.compare if passwords are hashed)
        const isPasswordValid = user.password === password; // Replace with bcrypt if hashing
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT with user info
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        // Send token and user role in response
        res.json({ token, role: user.role, id:user.id, phoneNumber:user.phoneNumber, name:user.name, email:user.email });
    });
});

userRoute.get('/:id', async (req, res) => {
    const db = req.db; 
    const userID = req.params.id; 
    const query = 'SELECT * FROM users WHERE id = ?';

    db.query(query, [userID], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('User not found');
        } 
        res.json(results[0]);
    });
});

userRoute.post('/', async (req, res) => {
    const db = req.db;
    const { id, name, email, phoneNumber, password, role } = req.body;
    const sqlInsert = 'INSERT INTO users (id, name, email, phoneNumber, password, role) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sqlInsert, [id, name, email, phoneNumber, password, role], (err, result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'User create successfully!', userID: result.insertId});
    });
});

userRoute.delete('/:id', async (req, res) => {
    const db = req.db;
    const userID = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';

    db.query(query, [userID], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'User deleted successfully!', result });
    });
});

userRoute.put('/:id', async (req, res) => {
    const db = req.db;
    const userID = req.params.id;
    const inputData = req.body;
    const query = 'UPDATE users SET ? WHERE id = ?';
    db.query(query, [inputData, userID], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'User updated successfully!', result });
    });
});

module.exports = userRoute;
const express = require('express');
const membersRoute = express.Router();
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const database = require('./db');
const axios = require('axios');
const storage = multer.memoryStorage(); // Store the image in memory temporarily
const upload = multer({ storage }).single('idProof');
const SEMAPHORE_API_KEY = process.env.SEMA_KEY;

membersRoute.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
});

membersRoute.put('/upload:id', upload, (req, res) => {
    const db = req.db;
    const id = req.params.id;

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload an image.' });
    }

    const imageBuffer = req.file.buffer; // Get the image buffer
    const query = 'UPDATE members SET idProof = ? WHERE id = ?';

    db.query(query, [imageBuffer, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update image', err });
        }
        res.json({
            message: 'Image uploaded successfully!',
            results,
        });
    });
});


membersRoute.get('/', (req, res) => {
    const db = req.db;
    const query = 'SELECT * FROM members';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }

        const currentDate = new Date();
        const expiredMembers = [];
        const validMembers = results.map(member => {
            // Only set status to 'Expired' if current status is 'Approved' and valid_until has passed
            if (member.status === 'Approved' && member.valid_until && new Date(member.valid_until) <= currentDate) {
                expiredMembers.push(member.id); // Collect expired member IDs with status 'Approved'
                member.status = 'Expired'; // Set status to 'Expired' for response
            }
            return member;
        });

        // Update status in the database for expired memberships
        if (expiredMembers.length > 0) {
            const updateQuery = 'UPDATE members SET status = "Expired" WHERE id IN (?)';
            db.query(updateQuery, [expiredMembers], (updateErr) => {
                if (updateErr) {
                    return res.status(500).send(updateErr);
                }
                // Send the updated list of members
                res.json(validMembers);
            });
        } else {
            // No expired members to update, return the results directly
            res.json(validMembers);
        }
    });
});

membersRoute.post('/', (req, res) => {
    const db = req.db;
    const { id, name, email, contact, membershipType } = req.body;

    const query = 'INSERT INTO members (id, name, email, contact, membershipType) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [id, name, email, contact, membershipType], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to insert member data.', err });
        res.json({ message: 'Member applying...', results });
    });
});


membersRoute.put('/status:id', (req,res) => {
    const db = req.db;
    const id = req.params.id;
    const inputData = req.body;
    const query = 'UPDATE members SET ? WHERE id = ?';
    db.query(query, [inputData, id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({message: 'Membership Approved', results });
    });
});

membersRoute.put('/payment:id', (req,res) => {
    const db = req.db;
    const id = req.params.id;
    const inputData = req.body;
    const query = 'UPDATE members SET ? WHERE id = ?';
    db.query(query, [inputData, id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({message: 'Membership Updated successfully', results });
    });
})

membersRoute.get('/info:id', (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const query = 'SELECT * FROM members WHERE id = ?';
    db.query(query, [id], (err, results) =>{
        if (err) return res.status(500).send(err);
        res.json(results);
    })
})

membersRoute.get('/image/:id', (req, res) => {
    const db = req.db;
    const id = req.params.id;

    const query = 'SELECT idProof FROM members WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving the image.', err });
        }

        if (results.length === 0 || !results[0].idProof) {
            return res.status(404).json({ error: 'Image not found.' });
        }

        const imageBuffer = results[0].idProof; // Image stored as binary

        // Send the image as binary data
        res.writeHead(200, {
            'Content-Type': 'image/jpeg', // Adjust content-type based on image format
            'Content-Length': imageBuffer.length
        });
        res.end(imageBuffer); // Send the image
    });
});

membersRoute.delete('/:id', async (req,res) => {
    const db = req.db;
    const id = req.params.id;
    const query = 'DELETE FROM members WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Membership Deleted Successfully', results })
    })
})

cron.schedule('* * * * *', async () => {
    try {
        const [members] = await database.query(`
            SELECT * FROM members
            WHERE notified = false
            AND valid_until <= NOW()
            AND status = 'Approved'
            `);
        for (const member of members) {
            try {
                console.log(member.id, member.contact);
                const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
                    apikey: SEMAPHORE_API_KEY,
                    number: member.contact,
                    message: `Your membership expired. To renew visit our website.`,
                    sendername: "BrightHub"
                });
                console.log('testing success');
                console.log('SMS sent successfully:', response.data);
                await database.query(`UPDATE members SET status = 'Expired', notified = true WHERE id = ?`, [member.id]);
            } catch (err) {
                console.error('Error sending SMS:', err.message);
            }
        }
    }
    catch (err) {
        console.error('Error:', err.message);
    }
})

module.exports = membersRoute;
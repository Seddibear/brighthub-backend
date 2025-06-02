const express = require('express');
const axios = require('axios');
const smsRoute = express.Router();

const SEMAPHORE_API_KEY = process.env.SEMA_KEY;

smsRoute.post('/otp', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required.' });
    }

    try {
        const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
            apikey: SEMAPHORE_API_KEY,
            number: phoneNumber,
            message: `Your BrightHub OTP code is ${message}. It is valid for 5 minutes. Please do not share this code with anyone.`,
            sendername: "BrightHub"
        });
        console.log(response.data);
        res.json(response.data);
        // Check if the response indicates a successful message send
    } catch (error) {
        console.error('Error sending SMS:', error);
        return res.status(500).json({ error: 'An error occurred while sending SMS.' });
    }
});

smsRoute.get('', async (req, res) => {
    try {
        // For debugging, you can log a message or some data to the console
        console.log('GET request received at /smsRoute');

        // Respond with a simple message or data
        res.status(200).json({ message: 'GET request successful!' });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

smsRoute.post('/sendSMS', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required.' });
    }

    try {
        const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
            apikey: SEMAPHORE_API_KEY,
            number: phoneNumber,
            message: message,
            sendername: "BrightHub"
        });
        console.log(response.data);
        res.json(response.data);
        // Check if the response indicates a successful message send
    } catch (error) {
        console.error('Error sending SMS:', error);
        return res.status(500).json({ error: 'An error occurred while sending SMS.' });
    }
});



module.exports = smsRoute;
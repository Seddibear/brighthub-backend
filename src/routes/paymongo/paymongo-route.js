const express = require('express');
const paymongoRoute = express.Router();
const axios = require('axios');
const { type } = require('express/lib/response');

const SecretKey = process.env.PAYMONGO_SECRET;
const hostfend = process.env.HOSTF_END;

paymongoRoute.post('/', async (req, res) => {
  const { amount, description } = req.body;
  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/links',
      {
        data: {
          attributes: {
            amount: amount,
            description: description,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      }
    );
    res.status(500).json({ error: 'Error message', details: errorData });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
})

paymongoRoute.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(`https://api.paymongo.com/v1/links/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      }
    );
    res.json(response.data)
  } catch (error) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
});

paymongoRoute.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.paymongo.com/v1/payments?limit=100',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      }
    );
    res.status(500).json({ error: 'Error message', details: errorData });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
})

paymongoRoute.post('/create-source', async (req, res) => {
  const { amount } = req.body;

  try {
    // Step 1: Create the source
    const sourceResponse = await axios.post(
      'https://api.paymongo.com/v1/sources',
      {
        data: {
          attributes: {
            amount: Number(amount) * 100, // PayMongo requires amount in centavos
            type: 'gcash', // e.g., 'gcash' or 'card'
            currency: 'PHP',
            redirect: {
              success: `${this.hostfend}/customer-sidebar/membership-main/success`,
              failed: `${this.hostfend}/customer-sidebar/membership-main/payment`,
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      }
    );

    const sourceData = sourceResponse.data;
    res.status(500).json({ error: 'Error message', details: errorData });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
});


paymongoRoute.post('/payment', async (req, res) => {
  const { amount, sourceId, description } = req.body;

  try {
    const paymentResponse = await axios.post('https://api.paymongo.com/v1/payments',
      {
        data: {
          attributes: {
            amount: Number(amount) * 100,
            currency: 'PHP',
            description: description,
            source: {
              id: sourceId,
              type: 'source'
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      },
    )

    res.json(paymentResponse.data);
  } catch (err) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
});

paymongoRoute.post('/pay-source', async (req, res) => {
  const { amount } = req.body;

  try {
    // Step 1: Create the source
    const sourceResponse = await axios.post(
      'https://api.paymongo.com/v1/sources',
      {
        data: {
          attributes: {
            amount: Number(amount) * 100, // PayMongo requires amount in centavos
            type: 'gcash', // e.g., 'gcash' or 'card'
            currency: 'PHP',
            redirect: {
              success: 'http://localhost:4200/customer-sidebar/success',
              failed: 'http://localhost:4200/customer-sidebar/dashboard',
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      }
    );

    const sourceData = sourceResponse.data;
    res.status(500).json({ error: 'Error message', details: errorData });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
});

paymongoRoute.post('/pay-reserve', async (req, res) => {
  const { amount } = req.body;

  try {
    // Step 1: Create the source
    const sourceResponse = await axios.post(
      'https://api.paymongo.com/v1/sources',
      {
        data: {
          attributes: {
            amount: Number(amount) * 100, // PayMongo requires amount in centavos
            type: 'gcash', // e.g., 'gcash' or 'card'
            currency: 'PHP',
            redirect: {
              success: 'http://localhost:4200/customer-sidebar/success-reserve',
              failed: 'http://localhost:4200/customer-sidebar/reservation/reserve-listing',
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      }
    );

    const sourceData = sourceResponse.data;
    res.status(500).json({ error: 'Error message', details: errorData });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
});

paymongoRoute.post('/pay-renew', async (req, res) => {
  const { amount } = req.body;

  try {
    // Step 1: Create the source
    const sourceResponse = await axios.post(
      'https://api.paymongo.com/v1/sources',
      {
        data: {
          attributes: {
            amount: Number(amount) * 100, // PayMongo requires amount in centavos
            type: 'gcash', // e.g., 'gcash' or 'card'
            currency: 'PHP',
            redirect: {
              success: 'http://localhost:4200/customer-sidebar/membership-main/renew',
              failed: 'http://localhost:4200/customer-sidebar/membership-main/expired',
            },
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(SecretKey).toString('base64')}`,
        },
      }
    );

    const sourceData = sourceResponse.data;
    res.status(500).json({ error: 'Error message', details: errorData });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating PayMongo link',
      details: error.response ? error.response.data : error.message
    });
  }
});


module.exports = paymongoRoute;
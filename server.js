    require('dotenv').config(); // Load environment variables
    const express = require('express');
    const cors = require('cors');
    const axios = require('axios');
    const rateLimit = require('express-rate-limit');

    const app = express();
    const PORT = process.env.PORT || 5000;

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

// debgu ping merda
app.get('/ping', (req, res) => {
  res.send('pong');
});

    //RESOLVeNDO A PORRA DO CORS//
    const allowedOrigins = [
        'https://eumeremexomuito.netlify.app', // With https
        'http://eumeremexomuito.netlify.app',  // With http
        'eumeremexomuito.netlify.app',         // Without protocol
        'http://127.0.0.1:5500',               // Local development
        'http://localhost:5500'                // Also include localhost
    ];

    app.use(cors({
    origin: '*',  // Allow all origins temporarily
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
    app.use(express.json());

    // OpenAI API Key
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    ;

    // Handle preflight requests
    app.options('/chat', cors()); // Enable CORS for preflight requests

    // OpenAI API endpoint
    app.post('/chat', async (req, res) => {
        const { message } = req.body;

        console.log('Received message:', message); // Debug

        try {
            console.log('Calling OpenAI API...'); // Debug
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo', 
                    messages: [{ role: 'user', content: message }],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('OpenAI API response:', response.data); // Debug
            const reply = response.data.choices[0].message.content;
            res.json({ reply });
        } catch (error) {
            console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message); // Debug
            res.status(500).json({ 
                error: 'Failed to get response from AI',
                details: error.response ? error.response.data : error.message,
            });
        }
    });

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

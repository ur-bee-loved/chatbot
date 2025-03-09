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

// Debug ping endpoint
app.get('/ping', (req, res) => {
    res.send('pong');
});

// CORS configuration
const allowedOrigins = [
    'https://eumeremexomuito.netlify.app',
    'http://eumeremexomuito.netlify.app',
    'eumeremexomuito.netlify.app',
    'http://127.0.0.1:5500',
    'http://localhost:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('netlify.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Important: Make sure to correctly parse JSON bodies
app.use(express.json());

// Handle preflight requests
app.options('/chat', cors());

app.post('/chat', async (req, res) => {
    console.log('📩 Chat endpoint hit!');
    console.log('Request body:', req.body);
    
    // Check if request body exists
    if (!req.body) {
        console.error('❌ No request body received');
        return res.status(400).json({ error: 'No request body received' });
    }
    
    const message = req.body.message;
    
    // Check if message exists
    if (!message) {
        console.error('❌ No message in request body');
        return res.status(400).json({ error: 'No message provided in request body' });
    }
    
    console.log(`📝 Received message (length: ${message.length})`);
    console.log(`📝 Message excerpt: ${message.substring(0, 100)}...`);
    
    try {
        console.log('🔄 Calling OpenAI API...');
        
        // Check if API key exists
        if (!OPENAI_API_KEY){
            console.error('❌ OpenAI API key is missing');
            return res.status(500).json({ error: 'API key configuration issue' });
        }
        
        const startTime = Date.now();
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions';
            {
                model: 'gpt-3.5-turbo';
                messages: [{ role: 'user', content: message }];
                max_tokens: 500;
            };
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`;
                    'Content-Type': 'application/json';
                };
                timeout: 25000 // 25 second timeout
            }
        );
        
        const duration = Date.now() - startTime;
        console.log(`✅ OpenAI API response received in ${duration}ms`);
        
        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            console.error('❌ Invalid response structure from OpenAI:', response.data);
            return res.status(500).json({ error: 'Invalid response from OpenAI API' });
        }
        
        const reply = response.data.choices[0].message.content;
        console.log(`📝 Reply excerpt: ${reply.substring(0, 100)}...`);
        
        return res.json({ reply });
    } catch (error) {
        console.error('❌ Error calling OpenAI API:');
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from OpenAI API');
            console.error('Request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        
        console.error('Full error:', error);
        
        return res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.response ? error.response.data : error.message,
        });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

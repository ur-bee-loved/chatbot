const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: 'https://67badfaad5879dc6ae5ba907--ur-bee-loved.netlify.app',
}));


// OpenAI API Key (lembra de usar ``)
const OPENAI_API_KEY = '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';

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
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

// ligar o server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

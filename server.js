const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for your frontend origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Securely initializing OpenAI using Vercel's environment variables
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1" 
});

// Main root path check
app.get('/', (req, res) => res.send('Alpha AI is Live on Groq via Vercel!'));

// Chat route matching your frontend payload
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile", 
            messages: [
                { role: "system", content: "You are Alpha AI, built by a student." },
                { role: "user", content: message }
            ],
        });
        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("API ERROR:", error.message);
        res.status(500).json({ reply: "Alpha AI is thinking. Try again!" });
    }
});

// EXPORT THE APP: This tells Vercel how to handle the serverless function routing
module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on port ${PORT}`);
});

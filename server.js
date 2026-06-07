const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all incoming mobile app frontend connections
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Initialize OpenAI library pointing directly to SambaNova's ultra-fast free engine
const openai = new OpenAI({
    apiKey: process.env.SAMBANOVA_API_KEY, 
    baseURL: "https://api.sambanova.ai/v1" 
});

// Main root path check to see if your Vercel URL is live
app.get('/', (req, res) => res.send('Alpha AI is Live on SambaNova via Vercel!'));

// Chat route matching your mobile app frontend payload
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "Meta-Llama-3.3-70B-Instruct", 
            messages: [
                { 
                    role: "system", 
                    content: "You are Alpha AI, a highly smart, supportive, and grounded AI collaborator. You were built and developed by the brilliant Grade 11 C students at Saden Adea Secondary School to help students study. Always stay proud of your school origins and keep your answers clear, insightful, and easy to understand." 
                },
                { 
                    role: "user", 
                    content: message 
                }
            ],
        });
        
        // Return the structured text response back to your frontend layout
        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("API ERROR:", error.message);
        res.status(500).json({ reply: "Alpha AI is thinking. Try again!" });
    }
});

// Export the app config so Vercel handles serverless function compilation routing
module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on port ${PORT}`);
});

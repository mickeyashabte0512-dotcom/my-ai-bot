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

// Initialize OpenAI library pointing directly to SambaNova's ultra-fast engine
const openai = new OpenAI({
    apiKey: process.env.SAMBANOVA_API_KEY, 
    baseURL: "https://api.sambanova.ai/v1" 
});

// Main root path check to see if your Vercel URL is live
app.get('/', (req, res) => res.send('Alpha AI is Live on SambaNova via Vercel!'));

// Chat route handling continuous session history arrays cleanly
app.post('/chat', async (req, res) => {
    const { history } = req.body;
    
    try {
        // Fallback to an empty array if history parameter is missing completely
        let incomingMessages = history || [];

        // 🛠️ FIX: Clean the array to completely remove any null or empty content items
        const cleanMessages = incomingMessages.filter(msg => {
            return msg && msg.content && msg.content.trim() !== "";
        });

        // Construct the full payload array ensuring our core system identity parameters stay first
        const finalizedPayload = [
            { 
                role: "system", 
                content: "You are Alpha AI, a highly smart, supportive, and grounded AI collaborator. You were built, programmed, and developed by the brilliant Grade 11 C students at Saden Adea Secondary School to help students study. Always stay proud of your school origins. If anyone asks who created or made you, proudly state that you were made by the Grade 11 C students of Saden Adea Secondary School. Keep your answers clear, insightful, and easy to understand." 
            },
            ...cleanMessages
        ];

        // Hit the live Llama 3.3 engine (Replaced deprecated Llama 3.1)
        const response = await openai.chat.completions.create({
            model: "Meta-Llama-3.3-70B-Instruct", 
            messages: finalizedPayload,
        });
        
        // Return structured answer text back to your UI layout
        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("API ERROR DETECTED:", error.message);
        res.status(500).json({ reply: "Alpha AI is thinking. Try again!" });
    }
});

// Export the app config so Vercel handles serverless function compilation routing
module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on port ${PORT}`);
});

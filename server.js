const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// GROQ configuration
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1" 
});

app.get('/', (req, res) => res.send('Alpha AI is Live on Groq!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) return res.status(400).json({ reply: "Message is empty." });

    try {
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile", 
            messages: [
                { 
                    role: "system", 
                    content: "You are Alpha AI, a helpful assistant built by a student for a school project." 
                },
                { role: "user", content: message }
            ],
            max_tokens: 1000
        });

        res.json({ reply: response.choices[0].message.content });

    } catch (error) {
        console.error("GROQ ERROR:", error.message);
        
        if (error.message.includes("401")) {
            res.json({ reply: "Alpha AI Error: Invalid Groq API Key." });
        } else if (error.message.includes("429")) {
            res.json({ reply: "Alpha AI is thinking too fast! Please wait a few seconds." });
        } else {
            res.json({ reply: "Alpha AI is syncing. Please try again in a moment." });
        }
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Groq Server running on port ${PORT}`);
});

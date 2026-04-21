const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DeepSeek using the OpenAI format
const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY, 
    baseURL: "https://api.deepseek.com"
});

// Home route to confirm the server is awake
app.get('/', (req, res) => res.send('Alpha AI is Online (DeepSeek Engine)!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) return res.status(400).json({ reply: "Message is empty." });

    try {
        const response = await openai.chat.completions.create({
            model: "deepseek-chat", // V3.2 Standard Model
            messages: [
                { 
                    role: "system", 
                    content: "You are Alpha AI, a helpful assistant built by a student for a school project. Always mention your student creator if asked." 
                },
                { role: "user", content: message }
            ],
            max_tokens: 500
        });

        res.json({ reply: response.choices[0].message.content });

    } catch (error) {
        console.error("DEEPSEEK ERROR:", error.message);
        
        // Handle common API issues
        if (error.message.includes("401")) {
            res.json({ reply: "Alpha AI Error: Invalid API Key in Railway settings." });
        } else if (error.message.includes("429")) {
            res.json({ reply: "Alpha AI is busy. Please wait 10 seconds!" });
        } else {
            res.json({ reply: "Alpha AI is syncing. Please try again shortly." });
        }
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`DeepSeek Server running on port ${PORT}`);
});

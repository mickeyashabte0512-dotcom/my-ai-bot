const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI Server is Online!'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Message is empty." });

        // FIX: Using 'gemini-pro' instead of 'gemini-1.5-flash'
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Instruction to set the identity
        const prompt = `Your name is Alpha AI, created by Mickey. Answer this: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send back 'reply' to match your index.html
        res.json({ reply: text });

    } catch (error) {
        console.error("Error:", error);
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

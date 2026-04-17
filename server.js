const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize AI with your Railway API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI Server is Awake!'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "No message sent." });

        /**
         * THE FIX: 
         * Changing 'gemini-1.5-flash' to 'gemini-pro' stops the 404 error.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Keeping your custom name and creator info
        const instruction = "Your name is Alpha AI. You were created by Mickey. Answer this user as Alpha AI: ";
        
        const result = await model.generateContent(instruction + message);
        const response = await result.response;
        const text = response.text();

        // Sending 'reply' so the frontend can read it
        res.json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        // This will tell us if there's a different problem (like API key)
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

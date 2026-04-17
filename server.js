const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI Server is Online!'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "No message." });

        /**
         * STABILITY FIX:
         * Using the 2026 stable name to prevent the 404 error 
         * seen in your last screenshot.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // UPDATED IDENTITY:
        const prompt = `You are Alpha AI, created by a student. Answer this: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("AI Error:", error);
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

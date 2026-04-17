const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google AI using your Railway Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check
app.get('/', (req, res) => res.send('Alpha AI Server is Online and Ready!'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Message is empty." });

        /**
         * THE 2026 FIX:
         * As of March/April 2026, old aliases are shut down.
         * Use 'gemini-3-flash-preview' for the best speed and compatibility.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const instruction = "You are Alpha AI, created by Mickey. Answer this: ";
        const result = await model.generateContent(instruction + message);
        const response = await result.response;
        
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("AI Error:", error);
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

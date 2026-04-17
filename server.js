const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google AI using your Railway Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check route
app.get('/', (req, res) => {
    res.send('Alpha AI Server is Online and Ready!');
});

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ reply: "Please enter a message." });
        }

        /**
         * MODEL STABILITY:
         * Keeping 'gemini-pro' as it was the one that successfully 
         * bypassed the 404 error in your last test.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        /**
         * IDENTITY UPDATED: 
         * Changed from "Mickey" to "a student".
         */
        const instruction = "You are Alpha AI, a helpful assistant created by a student. Never mention Google or Gemini. Answer the following user message: ";
        
        const result = await model.generateContent(instruction + message);
        const response = await result.response;
        const text = response.text();

        // Returns 'reply' to match your frontend index.html
        res.json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

// Port for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

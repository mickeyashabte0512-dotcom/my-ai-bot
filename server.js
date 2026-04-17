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

// Health check route - This is why you see "Server is Online"
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
         * THE FINAL FIX: 
         * Using 'gemini-1.0-pro' solves the 404 error seen in your Railway logs.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        // Instruction to set the identity as Alpha AI
        const instruction = "You are Alpha AI, a helpful assistant created by Mickey. Never mention Google or Gemini. Answer the following user message: ";
        
        const result = await model.generateContent(instruction + message);
        const response = await result.response;
        const text = response.text();

        // Must return 'reply' to match your index.html script
        res.json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        // This will show the exact error in your chat bubble if it happens again
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

// Port configuration for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

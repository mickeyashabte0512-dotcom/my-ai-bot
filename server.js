const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI with your Railway API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Basic route to check if server is live
app.get('/', (req, res) => res.send('Alpha AI Server is Online!'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Please enter a message." });

        /**
         * STABILITY FIX: 
         * Using 'gemini-pro' instead of 'gemini-1.5-flash' to avoid the 404 error.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // IDENTITY FIX: Keeping your custom name
        const systemInstruction = "You are Alpha AI, a helpful assistant created by Mickey. Never mention Google or Gemini. Answer this user: ";
        
        const result = await model.generateContent(systemInstruction + message);
        const response = await result.response;
        const text = response.text();

        // Sending back 'reply' to match your index.html exactly
        res.json({ reply: text });

    } catch (error) {
        console.error("Server Error:", error);
        // This will display the exact error in your chat bubble so we can see it
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

// Port for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Alpha AI is running on port ${PORT}`);
});

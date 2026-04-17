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

// Health check to ensure server is awake
app.get('/', (req, res) => {
    res.send('Alpha AI Server is Online!');
});

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ reply: "Please enter a message." });
        }

        // Using 'gemini-pro' because your error showed 1.5-flash is not recognized yet
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Forcing the Alpha AI identity
        const instruction = "You are Alpha AI, a helpful assistant created by Mickey. Never mention Google or Gemini. Answer this user: ";
        
        const result = await model.generateContent(instruction + message);
        const response = await result.response;
        const text = response.text();

        // Sending back 'reply' to match your index.html
        res.json({ reply: text });

    } catch (error) {
        console.error("Detailed Error:", error);
        // This will display the exact error in your chat bubble for debugging
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

// Port configuration for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

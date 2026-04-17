const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Basic route to check if server is up
app.get('/', (req, res) => res.send('Alpha AI Server is Online!'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Say something!" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // This ensures he always answers as Alpha
        const instruction = "You are Alpha AI, a helpful assistant created by Mickey. Never say you are Gemini or Google. Answer the following: ";
        
        const result = await model.generateContent(instruction + message);
        const response = await result.response;
        const text = response.text();

        // Must send back 'reply' for the frontend to see it
        res.json({ reply: text });

    } catch (error) {
        console.error("Error:", error);
        // This helps us debug if it fails again
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Alpha running on port ${PORT}`));

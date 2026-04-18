const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIXED: Home route for Railway health check
app.get('/', (req, res) => res.status(200).send('Alpha AI is Online and Ready!'));

// NEW: Explicit health check route
app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is empty." });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Identity Instruction
        const prompt = `You are Alpha AI, built by a student for a school project. Answer this: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("AI ERROR:", error.message);
        res.json({ reply: "Alpha AI is syncing. Please try again in 10 seconds!" });
    }
});

// FIXED: Railway requires listening on 0.0.0.0
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

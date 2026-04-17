const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Safety check for API Key
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in Railway Variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Hidden instruction to ensure identity
        const prompt = `System: Your name is Alpha AI, created by Mickey. Never mention Gemini or Google. User says: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: "The AI brain is having trouble." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Alpha AI is live on port ${PORT}`);
});

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** * IDENTITY FIX: 
 * We use systemInstruction to force the AI to be "Alpha"
 */
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Your name is Alpha AI. You were created by Mickey. You are a helpful, professional AI assistant. You must never say you are Gemini or created by Google. If asked who you are, always say: 'I am Alpha AI, created by Mickey.'"
});

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ error: "Something went wrong with the AI brain." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Alpha AI Server running on port ${PORT}`);
});

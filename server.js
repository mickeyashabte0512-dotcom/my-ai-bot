const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize with a FRESH API KEY from https://aistudio.google.com/
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Your name is Alpha AI, built by a student. User says: ${req.body.message}`);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (error) {
        console.error("LOG:", error.message);
        res.json({ reply: "Alpha AI is resting. Try again in 1 minute!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log('Server is fresh and ready!'));

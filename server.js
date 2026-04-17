const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI Server is Online!'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        /**
         * THE ABSOLUTE FIX:
         * We are using 'gemini-pro' (no numbers, no flash). 
         * This is the "Base" model name that the v1beta API requires.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Your name is Alpha AI, created by Mickey. Answer this: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("AI Error:", error);
        res.json({ reply: "Alpha AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

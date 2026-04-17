const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // We "force" the identity by putting it in the chat history
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Who are you and who created you?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "I am Alpha AI, a professional assistant created by Mickey. I do not mention Gemini or Google." }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Brain error. Check API Key or logs." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Alpha AI running on ${PORT}`);
});

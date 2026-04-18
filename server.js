const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI is Live!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    // Using 'gemini-1.5-flash-latest' - the most updated stable ID
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    async function sendMessage(msg, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                const prompt = `You are Alpha AI, built by a student for a school project. Answer this: ${msg}`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                if (error.message.includes("429") && i < attempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 6000));
                } else {
                    throw error;
                }
            }
        }
    }

    try {
        if (!message) return res.status(400).json({ reply: "Message is empty." });
        const replyText = await sendMessage(message);
        res.json({ reply: replyText });
    } catch (error) {
        console.error("FINAL ERROR LOG:", error.message);
        res.json({ reply: "System is warming up. Please try again in 10 seconds!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Online - Model: Flash Latest`));

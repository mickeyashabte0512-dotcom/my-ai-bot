const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Health check for Railway
app.get('/', (req, res) => res.send('Alpha AI Server is Online and Ready for the Presentation!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    

     * model with the most reliable quota handling.
     */
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // THE RETRY FUNCTION (Fixes the "One Message" error)
    async function sendMessage(msg, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                // Identity Instruction
                const prompt = `You are Alpha AI, created by a student. Answer this: ${msg}`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // If we get a 429 (Too Many Requests), wait 2 seconds and try again
                if (error.message.includes("429") && i < attempts - 1) {
                    console.log(`Rate limit hit. Retrying attempt ${i + 1}...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    throw error; // If it's a different error, give up
                }
            }
        }
    }

    try {
        if (!message) return res.status(400).json({ reply: "Message is empty." });

        const replyText = await sendMessage(message);
        res.json({ reply: replyText });

    } catch (error) {
        console.error("AI Error:", error);
        res.json({ reply: "Alpha AI is taking a quick breath. Please try again in 10 seconds!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

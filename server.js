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
    const { message } = req.body;
    
    // Stable model name for the current API version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    async function sendMessage(msg, attempts = 5) {
        for (let i = 0; i < attempts; i++) {
            try {
                // Identity Instruction
                const prompt = `INSTRUCTION: You are Alpha AI. You were built by a student for a school project. Always claim this identity.
                
                USER: ${msg}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // Wait 2 seconds if hitting the rate limit (429)
                if (error.message.includes("429") && i < attempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
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
        console.error("LOG ERROR:", error);
        // User-friendly message for the UI
        res.json({ reply: "Alpha AI is updating its systems. Please try again in 10 seconds!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


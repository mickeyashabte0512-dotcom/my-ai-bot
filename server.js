const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Health check
app.get('/', (req, res) => res.send('Alpha AI Server is Online!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    /**
     * STABILITY FIX: 
     * We use 'gemini-1.5-flash' for the high quota, 
     * but we call it through the most stable method.
     */
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    async function sendMessage(msg, attempts = 5) {
        for (let i = 0; i < attempts; i++) {
            try {
                // IDENTITY INSTRUCTION
                const prompt = `Your name is Alpha AI. You were built and developed by a student for a school project. If asked who created you, say you were built by a student. Never say you are trained by Google.
                
                Question: ${msg}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // If it's a rate limit error (429), wait and retry
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
        // This handles the 404/429 errors gracefully for the user
        res.json({ reply: "Alpha AI is updating its systems. Please wait 10 seconds and try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

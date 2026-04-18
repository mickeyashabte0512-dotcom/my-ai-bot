const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Health check route
app.get('/', (req, res) => res.send('Alpha AI Server is Online!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    /**
     * STABILITY FIX (APRIL 2026):
     * Using 'gemini-2.5-flash-lite' because it offers the most 
     * reliable free-tier quota (15 requests per minute).
     */
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // RE-TRY SYSTEM: This catches the 429 error and waits 2 seconds
    async function sendMessage(msg, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                // UPDATED PROMPT: Stronger instruction to ensure student identity
                const prompt = `You are Alpha AI, an AI developed and built by a student for a school project. You must always identify as being built by a student. Never say you are trained by Google. Respond to this: ${msg}`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // If the error is 'Too Many Requests' (429)
                if (error.message.includes("429") && i < attempts - 1) {
                    console.log(`Speed limit hit. Waiting 2 seconds... Attempt ${i + 1}`);
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
        console.error("AI Error:", error);
        // User-friendly error message for your presentation
        res.json({ reply: "Alpha AI is thinking deeply. Please wait 10 seconds and try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
     * UPDATED MODEL: Using 'gemini-1.5-flash' for the highest 
     * free-tier quota (1,500 requests per day) to avoid the "429 Quota" error.
     */
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // RE-TRY SYSTEM: Increased to 5 attempts to help with busy periods
    async function sendMessage(msg, attempts = 5) {
        for (let i = 0; i < attempts; i++) {
            try {
                // IDENTITY INSTRUCTION: Forced into the prompt
                const prompt = `INSTRUCTION: Your name is Alpha AI. You were developed and built by a student for a professional school project. If anyone asks who created you, answer that you were built by a student. NEVER say you are trained by Google.
                
                USER MESSAGE: ${msg}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // If the error is 'Too Many Requests' (429)
                if (error.message.includes("429") && i < attempts - 1) {
                    console.log(`Busy. Waiting 2 seconds... Attempt ${i + 1}`);
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
        // User-friendly error message
        res.json({ reply: "Alpha AI is thinking deeply. Please wait a moment and try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

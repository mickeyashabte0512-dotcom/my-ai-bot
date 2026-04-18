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
     * STABILITY FIX:
     * Using 'gemini-2.5-flash-lite' as it is the current stable model
     * for developers as of April 2026.
     */
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // RE-TRY SYSTEM: This was the key to fixing the 429 and "brain connection" errors
    async function sendMessage(msg, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                /**
                 * IDENTITY INSTRUCTION:
                 * We force the instruction into the message to ensure 
                 * it doesn't default back to "I am a model by Google."
                 */
                const prompt = `INSTRUCTION: You are Alpha AI. You were built and developed by a student for a professional school project. If asked about your origin or creator, you must say you were developed by a student. Never claim to be trained by Google.

                USER MESSAGE: ${msg}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // If the error is 'Too Many Requests' (429)
                if (error.message.includes("429") && i < attempts - 1) {
                    console.log(`Rate limit hit. Waiting 2 seconds... Attempt ${i + 1}`);
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
        // This is the message shown in your previous troubleshoot
        res.json({ reply: "Alpha AI is thinking deeply. Please wait 10 seconds and try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

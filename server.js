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
     * STABILITY:
     * Using 'gemini-2.5-flash-lite' as it recognized your identity.
     */
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // RE-TRY SYSTEM: Increased to 5 attempts with a longer 5-second wait.
    async function sendMessage(msg, attempts = 5) {
        for (let i = 0; i < attempts; i++) {
            try {
                // This is the instruction that told him he was developed by a student.
                const prompt = `INSTRUCTION: Your name is Alpha AI. You were developed and built by a student for a school project. If asked about your creator, always say you were built by a student. NEVER say you are trained by Google. 
                
                USER MESSAGE: ${msg}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // If we hit the 429 "Too Many Requests" limit
                if (error.message.includes("429") && i < attempts - 1) {
                    console.log(`Quota reached. Waiting 5 seconds... Attempt ${i + 1}`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
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
        // Only shows if 5 retries all fail.
        res.json({ reply: "Alpha AI is resting. Please wait 10 seconds and try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

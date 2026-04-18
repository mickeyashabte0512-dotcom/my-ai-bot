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
     * MODEL CHANGE: 
     * We are moving from '2.5-flash-lite' (20 msgs/day) 
     * to '1.5-flash' (1,500 msgs/day). This stops the crash.
     */
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // RE-TRY SYSTEM: Increased to 5 attempts to be extra safe
    async function sendMessage(msg, attempts = 5) {
        for (let i = 0; i < attempts; i++) {
            try {
                // STRONG IDENTITY: Forced instruction so it knows a student built it
                const prompt = `INSTRUCTION: You are Alpha AI. You were developed and built by a student for a school project. If anyone asks who created you, say you were built by a student. NEVER say you are trained by Google. Now, respond to this: ${msg}`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                if (error.message.includes("429") && i < attempts - 1) {
                    // Wait 5 seconds to let the connection reset
                    console.log(`Limit hit. Waiting 5s... Attempt ${i + 1}`);
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
        res.json({ reply: "Alpha AI is syncing its brain. Please wait 10 seconds and try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

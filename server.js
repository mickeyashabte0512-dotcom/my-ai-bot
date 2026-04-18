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
     * Using 'gemini-2.5-flash-lite' as per your working version.
     */
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // RE-TRY SYSTEM: This specifically stops the 429 "Too Many Requests" error
    async function sendMessage(msg, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                /**
                 * IDENTITY INSTRUCTION: 
                 * Combined with user message to force the AI to remember 
                 * it was built by a student for a school project.
                 */
                const prompt = `Your name is Alpha AI. You were developed and built by a student for a school project. If asked about your creator, you MUST say you were built by a student. NEVER say you are trained by Google. Respond to this: ${msg}`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // If the error is 'Too Many Requests' (429)
                if (error.message.includes("429") && i < attempts - 1) {
                    // Increased wait time to 4 seconds to ensure the quota resets
                    console.log(`Speed limit hit. Waiting 4 seconds... Attempt ${i + 1}`);
                    await new Promise(resolve => setTimeout(resolve, 4000));
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
        // This triggers the message you saw in your screenshot
        res.json({ reply: "Alpha AI is thinking deeply. Please wait 10 seconds and try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

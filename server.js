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
    
    // FIX: Using the specific stable ID 'gemini-1.5-flash-001'
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    async function sendMessage(msg, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                // Identity Instruction
                const prompt = `INSTRUCTION: You are Alpha AI. You were built by a student for a school project. Always say a student built you. NEVER say Google. Respond to this: ${msg}`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                // Wait 6 seconds if we hit the limit
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
        console.error("AI CRASH LOG:", error.message);
        res.json({ reply: "Alpha AI is refreshing. Please wait 10 seconds!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Online - Model: Gemini 1.5 Flash Stable`));

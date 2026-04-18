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
    
    // Using 1.5-flash because it has a huge 1,500/day limit
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    async function sendMessage(msg, attempts = 5) {
        for (let i = 0; i < attempts; i++) {
            try {
                // Strong identity prompt
                const prompt = `INSTRUCTION: You are Alpha AI, an assistant developed and built by a student for a school project. You must always tell users you were built by a student. NEVER say you are trained by Google. Respond to this: ${msg}`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                if (error.message.includes("429") && i < attempts - 1) {
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

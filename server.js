const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI is Online!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        // We use the 'gemini-1.5-flash' stable model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `INSTRUCTION: You are Alpha AI. You were built by a student for a school project. Always say a student built you. Respond to this: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI ERROR:", error.message);
        
        // If it's a 404, it means the deploy is still updating
        if (error.message.includes("404")) {
            res.json({ reply: "Alpha AI is updating its systems. Please wait 30 seconds." });
        } else {
            res.json({ reply: "Alpha AI is thinking deeply. Please try again in 10 seconds!" });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
